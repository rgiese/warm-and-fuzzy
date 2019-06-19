#include <Particle.h>

#include <Adafruit_DHT.h>

#define ARDUINOJSON_ENABLE_PROGMEM 0
#include <ArduinoJson.h>

#include <math.h>

#include "inc/coredefs.h"

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
pin_t constexpr c_rgRelayPins[] = {A0, A1, A2};
pin_t constexpr c_LedPin = D7;

DHT dht(c_dht22Pin, DHT22);

//
uint8_t constexpr c_cOneWireDevices_Max = 16;
OneWireGateway2484 oneWireGateway;

// Configuration
Configuration g_Configuration;

// Publishers
#include "publishers/StatusPublisher.h"
StatusPublisher g_StatusPublisher;

// Verification
unsigned long g_LastLoopEnterTime_msec;

//
// Declarations
//

void onStatusResponse(char const* szEvent, char const* szData);
int onTestOutput(String options);

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
    dht.begin();
    oneWireGateway.Initialize();

    for (size_t idxPin = 0; idxPin < countof(c_rgRelayPins); ++idxPin)
    {
        pinMode(c_rgRelayPins[idxPin], OUTPUT);
    }

    pinMode(c_LedPin, OUTPUT);

    // Configure cloud interactions (async since we're not yet connected to the cloud, courtesy of SYSTEM_MODE =
    // SEMI_AUTOMATIC)
    Particle.subscribe(System.deviceID() + "/hook-response/status", onStatusResponse, MY_DEVICES);
    Particle.function("testOutput", onTestOutput);

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
    unsigned long const loopStartTime_msec = millis();

    if (g_LastLoopEnterTime_msec != 0)
    {
        unsigned long const timeSinceLastLoopStart_msec = loopStartTime_msec - g_LastLoopEnterTime_msec;
        Serial.printlnf("-- Time since last loop start: %lu msec", timeSinceLastLoopStart_msec);
    }

    g_LastLoopEnterTime_msec = loopStartTime_msec;

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
        onboardTemperature = dht.getTempCelcius();
        onboardHumidity = dht.getHumidity();

        // Enumerate external devices
        oneWireGateway.EnumerateDevices([&](OneWireAddress const& Address) {
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
        if (OneWireTemperatureSensor::RequestMeasurement(oneWireGateway))
        {
            // Retrieve measurements
            for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
            {
                OneWireTemperatureSensor::RetrieveMeasurement(
                    rgExternalTemperatures[idxAddress], rgAddresses[idxAddress], oneWireGateway);
            }
        }
    }

    //
    // Publish data
    //

    {
        Activity publishActivity("PublishStatus");
        g_StatusPublisher.Publish(
            onboardTemperature, onboardHumidity, rgAddresses, cAddressesFound, rgExternalTemperatures);
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

    Thermostat::AllowedActions allowedActions;
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


//
// Functions
//

int onTestOutput(String options)
{
    Activity testOutputActivity("OnTestOutput");

    // The command should be formatted as N=[0,1], e.g. 2=1 to turn on relay 2.
    if (options.length() != 3)
    {
        return -1;
    }

    if (options.charAt(1) != '=')
    {
        return -1;
    }

    pin_t const idxRelay = static_cast<pin_t const>(options.charAt(0) - '0');
    uint8_t const desiredValue = static_cast<uint8_t const>(options.charAt(2) - '0');

    if (idxRelay >= countof(c_rgRelayPins))
    {
        return -1;
    }

    if (desiredValue > 1)
    {
        return -1;
    }

    // Force relay output
    digitalWrite(c_rgRelayPins[idxRelay], desiredValue);

    // Flash on-board LED as confirmation
    for (size_t idxFlash = 0; idxFlash < 2; ++idxFlash)
    {
        digitalWrite(c_LedPin, HIGH);
        delay(250);

        digitalWrite(c_LedPin, LOW);
        delay(250);
    }

    return 0;
}