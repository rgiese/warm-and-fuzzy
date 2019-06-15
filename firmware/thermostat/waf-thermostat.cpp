#include <Particle.h>

#include <Adafruit_DHT.h>

#define ARDUINOJSON_ENABLE_PROGMEM 0
#include <ArduinoJson.h>

#include <math.h>

#include "inc/FixedStringBuffer.h"
#include "inc/coredefs.h"

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

//
// Declarations
//

void onStatusResponse(char const* szEvent, char const* szData);
int onTestOutput(String options);

//
// Setup
//

void setup()
{
    // Configure debugging output
    Serial.begin();
    Serial.println("Thermostat started.");

    // Configure I/O
    dht.begin();
    oneWireGateway.Initialize();

    for (size_t idxPin = 0; idxPin < countof(c_rgRelayPins); ++idxPin)
    {
        pinMode(c_rgRelayPins[idxPin], OUTPUT);
    }

    pinMode(c_LedPin, OUTPUT);

    // Configure cloud interactions
    Particle.subscribe(System.deviceID() + "/hook-response/status", onStatusResponse, MY_DEVICES);

    Particle.function("testOutput", onTestOutput);
}

//
// Loop
//

void loop()
{
    // WiFi testing
    Serial.printlnf("WiFi SSID: %s", WiFi.SSID());

    //
    // Acquire data
    //

    // Onboard devices
    float const temperature = dht.getTempCelcius();
    float const humidity = dht.getHumidity();

    // Enumerate external devices
    OneWireAddress rgAddresses[c_cOneWireDevices_Max];
    size_t cAddressesFound = 0;

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
    float rgExternalTemperatures[c_cOneWireDevices_Max] = {NAN};

    if (OneWireTemperatureSensor::RequestMeasurement(oneWireGateway))
    {
        // Retrieve measurements
        for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
        {
            OneWireTemperatureSensor::RetrieveMeasurement(
                rgExternalTemperatures[idxAddress], rgAddresses[idxAddress], oneWireGateway);
        }
    }

    //
    // Publish data
    //

    size_t constexpr cchTelemetry =
        static_strlen("{'ts':‭4294967295‬,'v':[]}")  // Top-level elements
        + static_strlen("{'t':-100.0,'h':100.0},")       // Values from on-board sensors
        + c_cOneWireDevices_Max *
              static_strlen("{'id':'001122334455667788','t':-100.0,'h':100.0},")  // Values from external sensors
        + 4;                                                                      // wiggle room

    FixedStringBuffer<cchTelemetry> sb;

    sb.AppendFormat("{\"ts\":%u,\"v\":[", Time.now());
    {
        bool isCommaNeeded = false;

        if (!isnan(temperature) && !isnan(humidity))
        {
            sb.AppendFormat("{\"t\":%.1f,\"h\":%.1f}", temperature, humidity);

            isCommaNeeded = true;
        }

        for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
        {
            if (isnan(rgExternalTemperatures[idxAddress]))
            {
                continue;
            }

            if (isCommaNeeded)
            {
                sb.Append(",");
            }

            char rgAddress[OneWireAddress::sc_cchAsHexString_WithTerminator];
            rgAddresses[idxAddress].ToString(rgAddress);

            sb.AppendFormat("{\"id\":\"%s\",\"t\":%.1f}", rgAddress, rgExternalTemperatures[idxAddress]);

            isCommaNeeded = true;
        }
    }
    sb.AppendFormat("]}");

    Particle.publish("status", sb.ToString(), 60 /* TTL, unused */, PRIVATE);
    Serial.println(sb.ToString());

    delay(60 * 1000);
}

//
// Subscriptions
//

void onInvalidStatusResponse(char const* szEvent, char const* szData, char const* szReason)
{
    Serial.printlnf("onStatusResponse: %s for %s = %s", szReason, szEvent, szData);
}

void onStatusResponse(char const* szEvent, char const* szData)
{
    if (strstr(szEvent, "/hook-response/status/0") == nullptr)  // [deviceID]/hook-response/status/0
    {
        onInvalidStatusResponse("Unexpected event", szEvent, szData);
        return;
    }

    // Set up document
    size_t constexpr cbJsonDocument = JSON_OBJECT_SIZE(1)  // {"sp":25.0}
                                      + countof("sp")      // string copy of "sp"
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
    float setPoint;
    {
        JsonVariant variant = jsonDocument.getMember("sp");

        if (variant.isNull() || !variant.is<float>())
        {
            onInvalidStatusResponse("'sp' missing or invalid", szEvent, szData);
            return;
        }

        setPoint = variant.as<float>();
    }

    Serial.printlnf("Updated config: set point = %.1f", setPoint);
}


//
// Functions
//

int onTestOutput(String options)
{
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