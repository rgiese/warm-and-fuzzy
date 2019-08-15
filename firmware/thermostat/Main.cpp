#include <Particle.h>

#include "PietteTech_DHT.h"

#include <math.h>

#include "inc/CoreDefs.h"

#include "inc/Activity.h"
#include "inc/Thermostat.h"

#include "inc/Configuration.h"

#include "onewire/OneWireGateway2484.h"
#include "onewire/OneWireTemperatureSensor.h"

//
// Particle configuration
//

PRODUCT_ID(8773);
PRODUCT_VERSION(8);  // Increment for each release


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
Thermostat g_Thermostat;

// Publishers
#include "publishers/StatusPublisher.h"
StatusPublisher g_StatusPublisher;

//
// Declarations
//

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
    static unsigned long s_LastLoopEnterTime_msec = 0;

    unsigned long const loopStartTime_msec = millis();

    if (s_LastLoopEnterTime_msec != 0)
    {
        unsigned long const timeSinceLastLoopStart_msec = loopStartTime_msec - s_LastLoopEnterTime_msec;
        Serial.printlnf("-- Time since last loop start: %lu msec", timeSinceLastLoopStart_msec);
    }

    s_LastLoopEnterTime_msec = loopStartTime_msec;

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

    //
    // Apply data
    //

    g_Thermostat.Apply(g_Configuration, onboardTemperature);

    //
    // Publish data
    //

    {
        Activity publishActivity("PublishStatus");
        g_StatusPublisher.Publish(g_Configuration,
                                  g_Thermostat.CurrentActions(),
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

        unsigned long const loopEndTime_msec = millis();
        unsigned long const loopDuration_msec = loopEndTime_msec - loopStartTime_msec;

        unsigned long const loopDesiredCadence_msec = g_Configuration.Cadence() * 1000;

        if (loopDuration_msec > loopDesiredCadence_msec)
        {
            // No further delay required
        }
        else
        {
            // Delay for remainder of desired cadence
            delay(loopDesiredCadence_msec - loopDuration_msec);
        }
    }
}


//
// Subscriptions
//

void onStatusResponse(char const* szEvent, char const* szData)
{
    Activity statusResponseActivity("StatusResponse");

    if (strstr(szEvent, "/hook-response/status/0") == nullptr)  // [deviceID]/hook-response/status/0
    {
        Serial.printlnf("Unexpected event %s with data %s", szEvent, szData);
        return;
    }

    Configuration::ConfigUpdateResult const configUpdateResult = g_Configuration.UpdateFromString(szData);

    if (configUpdateResult == Configuration::ConfigUpdateResult::Invalid)
    {
        return;
    }

    Serial.print((configUpdateResult == Configuration::ConfigUpdateResult::Updated) ? "Updated" : "Retained");
    Serial.print(" configuration: ");
    g_Configuration.PrintConfiguration();
}

int onConfigPush(String configString)
{
    Activity configPushActivity("ConfigPush");

    Configuration::ConfigUpdateResult const configUpdateResult = g_Configuration.UpdateFromString(configString.c_str());

    if (configUpdateResult != Configuration::ConfigUpdateResult::Invalid)
    {
        Serial.print((configUpdateResult == Configuration::ConfigUpdateResult::Updated) ? "Updated" : "Retained");
        Serial.print(" configuration via push: ");
        g_Configuration.PrintConfiguration();
    }

    return static_cast<int>(configUpdateResult);
}