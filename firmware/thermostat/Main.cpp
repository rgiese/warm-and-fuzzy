#include <Particle.h>

#include <Adafruit_DHT.h>

#define ARDUINOJSON_ENABLE_PROGMEM 0
#include <ArduinoJson.h>

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
PRODUCT_VERSION(1);  // Increment for each release


//
// Globals
//

// Connect pin 1 (on the left) of the sensor to +5V
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

pin_t constexpr c_dht22Pin = D2;
pin_t constexpr c_LedPin = D7;

DHT g_OnboardSensor(c_dht22Pin, DHT22);

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

    float onboardTemperature;
    float onboardHumidity;

    OneWireAddress rgAddresses[c_cOneWireDevices_Max];
    size_t cAddressesFound = 0;

    float rgExternalTemperatures[c_cOneWireDevices_Max] = {NAN};

    {
        Activity acquireDataActivity("AcquireData");

        // Onboard devices
        onboardTemperature = g_OnboardSensor.getTempCelcius();
        onboardHumidity = g_OnboardSensor.getHumidity();

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
        g_StatusPublisher.Publish(g_Thermostat.CurrentActions(),
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

void onInvalidStatusResponse(char const* szReason, char const* szEvent, char const* szData)
{
    Serial.printlnf("onStatusResponse: %s for %s = %s", szReason, szEvent, szData);
}

void onStatusResponse(char const* szEvent, char const* szData)
{
    Activity statusResponseActivity("StatusResponse");

    if (strstr(szEvent, "/hook-response/status/0") == nullptr)  // [deviceID]/hook-response/status/0
    {
        onInvalidStatusResponse("Unexpected event", szEvent, szData);
        return;
    }

    // Set up document
    size_t constexpr cbJsonDocument = JSON_OBJECT_SIZE(4)  // {"sp":25.0, "th": 1.0, "ca": 60, "aa": "HCR"}
                                      + countof("sp")      // string copy of "sp" (setPoint)
                                      + countof("th")      // string copy of "th" (threshold)
                                      + countof("ca")      // string copy of "ca" (cadence)
                                      + countof("aa")      // string copy of "am" (allowedActions)
                                      + countof("HCR")     // string copy of potential values for aa (allowedActions)
        ;

    StaticJsonDocument<cbJsonDocument> jsonDocument;
    {
        DeserializationError const jsonError = deserializeJson(jsonDocument, szData);

        if (jsonError)
        {
            onInvalidStatusResponse("Failed to deserialize", szEvent, szData);
            return;
        }
    }

    // Extract values from document
    // (goofy macro because ArduinoJson's variant.is<> can't be used inside a template with gcc)

#define GET_JSON_VALUE(MemberName, Target)                                               \
    JsonVariant variant = jsonDocument.getMember(MemberName);                            \
                                                                                         \
    if (variant.isNull() || !variant.is<decltype(Target)>())                             \
    {                                                                                    \
        onInvalidStatusResponse("'" MemberName "' missing or invalid", szEvent, szData); \
        return;                                                                          \
    }                                                                                    \
                                                                                         \
    Target = variant.as<decltype(Target)>();

    float setPoint;
    {
        GET_JSON_VALUE("sp", setPoint);
    }

    float threshold;
    {
        GET_JSON_VALUE("th", threshold);
    }

    uint16_t cadence;
    {
        GET_JSON_VALUE("ca", cadence);
    }

    Thermostat::Actions allowedActions;
    {
        char const* szAllowedActions;
        {
            GET_JSON_VALUE("aa", szAllowedActions);
        }

        if (!allowedActions.UpdateFromString(szAllowedActions))
        {
            onInvalidStatusResponse("'aa' contains invalid token", szEvent, szData);
            return;
        }
    }

#undef GET_JSON_VALUE

    // Commit values
    g_Configuration.SetPoint(setPoint);
    g_Configuration.Threshold(threshold);
    g_Configuration.Cadence(cadence);
    g_Configuration.AllowedActions(allowedActions);

    Serial.print(g_Configuration.IsDirty() ? "Updated" : "Retained");
    Serial.print(" configuration: ");
    g_Configuration.PrintConfiguration();

    g_Configuration.Flush();
}
