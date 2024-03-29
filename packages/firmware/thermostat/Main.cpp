#include <Particle.h>

#include "inc/stdinc.h"

#include "PietteTech_DHT.h"

//
// Particle configuration
//

PRODUCT_ID(8773);
PRODUCT_VERSION(18);  // Increment for each release


//
// Globals
//

// Connect pin 1 (on the left) of the sensor to +5V
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

pin_t constexpr c_dht22Pin = D2;
pin_t constexpr c_LedPin = D7;

PietteTech_DHT g_OnboardSensor(c_dht22Pin, DHT22);

//
uint8_t constexpr c_cOneWireDevices_Max = 16;
OneWireGateway2484 g_OneWireGateway;

// Configuration
Configuration g_Configuration;

// Services
ThermostatSetpointScheduler g_ThermostatSetpointScheduler;
Thermostat g_Thermostat;

// Publishers
StatusPublisher<c_cOneWireDevices_Max> g_StatusPublisher;

//
// Declarations
//

void applyTimezoneConfiguration();
void onStatusResponse(char const* szEvent, char const* szData);
int onConfigPush(String configString);

//
// Setup
//

SYSTEM_THREAD(ENABLED);       // separate app thread from networking thread, c.f.
                              // https://docs.particle.io/reference/device-os/firmware/photon/#system-thread
SYSTEM_MODE(SEMI_AUTOMATIC);  // defer networking connection until explicit call, c.f.
                              // https://docs.particle.io/reference/device-os/firmware/photon/#semi-automatic-mode

void setup()
{
    // Configure debugging output
    Serial.begin();
    Serial.println("Thermostat started.");

    {
        Activity testActivity("StartupTestDelay");
        delay(10 * 1000);
    }

    // Set up configuration
    g_Configuration.Initialize();

    Serial.print("Current configuration: ");
    g_Configuration.PrintConfiguration();

    applyTimezoneConfiguration();

    // Configure I/O
    g_OnboardSensor.begin();
    g_OneWireGateway.Initialize();

    pinMode(c_LedPin, OUTPUT);

    // Configure services
    g_Thermostat.Initialize();

    // Configure cloud interactions
    // (async since we're not yet connected to the cloud, courtesy of SYSTEM_MODE = SEMI_AUTOMATIC)
    Particle.subscribe(System.deviceID() + "/hook-response/status", onStatusResponse, MY_DEVICES);
    Particle.function("configPush", onConfigPush);

    // Request connection to cloud (not blocking)
    {
        Activity connectActivity("Connect");
        Particle.connect();
    }
}


//
// Loop
//

void loop()
{
    //
    // Set up loop time tracking
    //

    static unsigned long s_LastLoopEnterTime_msec = 0;

    unsigned long const loopStartTime_msec = millis();

    if (s_LastLoopEnterTime_msec != 0)
    {
        unsigned long const timeSinceLastLoopStart_msec = loopStartTime_msec - s_LastLoopEnterTime_msec;
        Serial.printlnf("-- Time since last loop start: %lu msec", timeSinceLastLoopStart_msec);
    }

    s_LastLoopEnterTime_msec = loopStartTime_msec;

    //
    // Ingest any configuration updates submitted by events
    //

    {
        bool const fUpdatedConfiguration = g_Configuration.AcceptPendingUpdates();

        if (fUpdatedConfiguration)
        {
            Serial.print("Accepted updated configuration: ");
            g_Configuration.PrintConfiguration();
        }
    }

    applyTimezoneConfiguration();  // Apply whether configuration has changed or not (e.g. we may have changed DST)

    {
        char const* rgDaysOfWeek[] = {"n/a", "Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"};

        uint32_t const timeNow = Time.now();
        int const idxDayOfWeek = Time.weekday(timeNow);

        Serial.printlnf("-- It is currently %02d:%02d on a %sday (%u Unix time)",
                        Time.hour(timeNow),
                        Time.minute(timeNow),
                        idxDayOfWeek < countof(rgDaysOfWeek) ? rgDaysOfWeek[idxDayOfWeek] : "<unexpected>",
                        timeNow);
    }

    //
    // Acquire data
    //

    float onboardTemperature = NAN;
    float onboardHumidity = NAN;

    OneWireAddress rgAddresses[c_cOneWireDevices_Max];
    size_t cAddressesFound = 0;

    float rgExternalTemperatures[c_cOneWireDevices_Max] = {NAN};

    {
        Activity acquireDataActivity("AcquireData");

        // Onboard devices
        int const sensorStatus = g_OnboardSensor.acquireAndWait(5000);  // 5 sec timeout should suffice

        if (sensorStatus == DHTLIB_OK)
        {
            onboardTemperature = g_OnboardSensor.getCelsius();
            onboardHumidity = g_OnboardSensor.getHumidity();
        }
        else
        {
            Serial.printlnf("Error '%d' acquiring DHT22 data. Skipping internal sensor.\n", sensorStatus);
        }

        // Enumerate external devices
        g_OneWireGateway.EnumerateDevices([&](OneWireAddress const& Address) {
            if (cAddressesFound < countof(rgAddresses))
            {
                if (Address.GetDeviceFamily() == 0x28)  // Ensure device is a DS18B20 sensor
                {
                    rgAddresses[cAddressesFound] = Address;
                    ++cAddressesFound;
                }
            }
        });

        // Request temperature measurement from all sensors
        if (OneWireTemperatureSensor::RequestMeasurement(g_OneWireGateway))
        {
            // Retrieve measurements
            for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
            {
                OneWireTemperatureSensor::RetrieveMeasurement(
                    rgExternalTemperatures[idxAddress], rgAddresses[idxAddress], g_OneWireGateway);
            }
        }
    }

    // Override onboard temperature if requested and available
    OneWireAddress const externalSensorId(g_Configuration.rootConfiguration().externalSensorId());
    float operableTemperature = onboardTemperature;
    bool fUsedExternalSensor = false;

    if (!externalSensorId.IsEmpty())
    {
        for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
        {
            // Find sensor by address
            if (rgAddresses[idxAddress] != externalSensorId)
            {
                continue;
            }

            // Make sure it has a reported value
            if (std::isnan(rgExternalTemperatures[idxAddress]))
            {
                continue;
            }

            // Apply override
            operableTemperature = rgExternalTemperatures[idxAddress];
            fUsedExternalSensor = true;

            // Punch out sensor from reported sensors list (no point in double-reporting)
            rgExternalTemperatures[idxAddress] = nan("");
        }

        if (!fUsedExternalSensor)
        {
            Serial.println("!! Warning: couldn't locate requested external sensor.");
        }
    }

    //
    // Apply data
    //

    ThermostatSetpoint const thermostatSetpoint =
        g_ThermostatSetpointScheduler.getCurrentThermostatSetpoint(g_Configuration);
    g_Thermostat.Apply(g_Configuration, thermostatSetpoint, operableTemperature);

    //
    // Publish data
    //

    {
        Activity publishActivity("PublishStatus");
        g_StatusPublisher.Publish(g_Configuration,
                                  thermostatSetpoint,
                                  g_Thermostat.CurrentActions(),
                                  fUsedExternalSensor,
                                  operableTemperature,
                                  onboardTemperature,
                                  onboardHumidity,
                                  rgAddresses,
                                  cAddressesFound,
                                  rgExternalTemperatures);
    }

    //
    // Perform deferred maintainance
    //

    {
        EEPROM.performPendingErase();
    }

    //
    // Delay until next iteration
    //

    {
        Activity loopDelayActivity("LoopDelay");

        while (true)
        {
            // (Carefully phrased to deal with rollovers)
            unsigned long const currentTime_msec = millis();
            unsigned long const timeSinceLastLoopStart_msec = currentTime_msec - loopStartTime_msec;

            unsigned long const loopDesiredCadence_msec = g_Configuration.rootConfiguration().cadence() * 1000;

            if (timeSinceLastLoopStart_msec > loopDesiredCadence_msec)
            {
                // No further delay required
                break;
            }

            if (g_Configuration.HasPendingUpdates())
            {
                // Skip remaining delay so we can act on the latest configuration changes right away
                break;
            }

            unsigned long const remainingTotalDelay_msec = loopDesiredCadence_msec - timeSinceLastLoopStart_msec;
            unsigned long const maxPollingDelay_msec = 2 * 1000;  // maximum time between config update checks

            delay(std::min(remainingTotalDelay_msec, maxPollingDelay_msec));
        }
    }
}


//
// Subscriptions
//

Configuration::ConfigUpdateResult handleUpdatedConfig(char const* const szData,
                                                      bool const fTrimQuotes,
                                                      char const* const szSource)
{
    //
    // szData should be text-encoded binary data
    // trailed with a format- and version-identifying magic string ("2Z85")
    // (c.f. //packages/api/src/shared/firmware/thermostatConfigurationAdapter.ts)
    // and may be enclosed in quotes
    //

    static char constexpr rgMagic[] = "3Z85";
    size_t const cchMagic = strlen(rgMagic);

    size_t const cchQuote = fTrimQuotes ? 1 : 0;

    // Check for correct header
    size_t const cchData = strlen(szData);
    size_t const cchData_Min = cchMagic + 2 * cchQuote;

    if (cchData < cchData_Min)
    {
        Serial.printlnf("-- Configuration invalid: too short: \"%s\"", szData);
        return Configuration::ConfigUpdateResult::Invalid;
    }

    if (cchData > static_cast<uint16_t>(-1))
    {
        Serial.println("-- Configuration invalid: too long");
        return Configuration::ConfigUpdateResult::Invalid;
    }

    if (strncmp(szData + cchQuote, rgMagic, cchMagic) != 0)
    {
        Serial.printlnf("-- Configuration invalid: wrong magic: \"%s\"", szData);
        return Configuration::ConfigUpdateResult::Invalid;
    }

    uint16_t const cchConfigData = cchData - cchMagic - 2 * cchQuote;
    char const* const rgConfigData = szData + cchQuote + cchMagic;

    // Submit update
    Configuration::ConfigUpdateResult const configUpdateResult =
        g_Configuration.SubmitUpdate(rgConfigData, cchConfigData);

    // Report results
    switch (configUpdateResult)
    {
        case Configuration::ConfigUpdateResult::Invalid:
            Serial.printlnf(
                "!! Configuration from %s \"%.*s\" invalid, ignoring.", szSource, cchConfigData, rgConfigData);
            break;

        case Configuration::ConfigUpdateResult::Retained:
            Serial.printlnf("Retained existing configuration after %s.", szSource);
            break;

        case Configuration::ConfigUpdateResult::Accepted:
            Serial.printlnf("Updating existing configuration from %s.", szSource);
            break;
    }

    return configUpdateResult;
}

void onStatusResponse(char const* szEvent, char const* szData)
{
    Activity statusResponseActivity("StatusResponse");

    if (strstr(szEvent, "/hook-response/status/0") == nullptr)  // [deviceID]/hook-response/status/0
    {
        Serial.printlnf("Unexpected event %s with data %s", szEvent, szData);
        return;
    }

    (void)handleUpdatedConfig(szData, true /* trim quotes */, "statusResponse");
}

int onConfigPush(String configString)
{
    Activity configPushActivity("ConfigPush");
    return static_cast<int>(handleUpdatedConfig(configString.c_str(), false /* no quotes */, "push"));
}


//
// Helpers
//

void applyTimezoneConfiguration()
{
    //
    // We don't bother telling Particle about DST, we'll just change zones (e.g. PST to PDT)
    // so the above is sufficient. We just need the math to work, we don't need nice formatting.
    //
    // Our configuration tells us the current timezone's offset as well as
    // the next one and when to switch over, in case we don't update frequently.
    //

    bool const inNextTimezone = g_Configuration.rootConfiguration().nextTimezoneChange() <= Time.now();

    // {current,next}TimezoneUTCOffset: signed IANA UTC offset, e.g. PST = 480
    int16_t const timezoneUTCOffset = inNextTimezone ? g_Configuration.rootConfiguration().nextTimezoneUTCOffset()
                                                     : g_Configuration.rootConfiguration().currentTimezoneUTCOffset();

    // particleTimezone: signed fractional hours, e.g. PST = -8.0
    float const particleTimezone = -1.0f * (timezoneUTCOffset / 60.0f);

    // Apply
    Time.zone(particleTimezone);
}