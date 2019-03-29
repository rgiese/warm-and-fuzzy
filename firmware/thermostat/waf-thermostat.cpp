#include <Particle.h>

#include <Adafruit_DHT.h>
#include <math.h>

#include "waf-helpers.h"

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

pin_t const c_dht22Pin = D2;
pin_t const c_rgRelayPins[] = {A0, A1, A2};
pin_t const c_LedPin = D7;

DHT dht(c_dht22Pin, DHT22);
OneWireGateway2484 oneWireGateway;

//
// Declarations
//

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
    Particle.function("testOutput", onTestOutput);
}

//
// Loop
//

void loop()
{
    //
    // Acquire data
    //

    // Note: Reading temperature or humidity takes about 250 milliseconds
    float const temperature = dht.getTempCelcius();
    float const humidity = dht.getHumidity();

    String externalData;
    {
        // Enumerate devices
        OneWireAddress rgAddresses[16];
        size_t cAddressesFound = 0;

        oneWireGateway.EnumerateDevices([&](OneWireAddress const& Address) {
            if (cAddressesFound < countof(rgAddresses))
                {
                    rgAddresses[cAddressesFound] = Address;
                    ++cAddressesFound;
                }
        });

        // Request temperature measurement from all sensors
        if (OneWireTemperatureSensor::RequestMeasurement(oneWireGateway))
            {
                // Retrieve measurements and format values
                for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
                    {
                        OneWireAddress const& address = rgAddresses[idxAddress];

                        if (address.GetDeviceFamily() == 0x28)  // Ensure device is a DS18B20 sensor
                            {
                                float externalTemperature;
                                if (OneWireTemperatureSensor::RetrieveMeasurement(
                                        externalTemperature, address, oneWireGateway))
                                    {
                                        if (externalData.length() > 0)
                                            {
                                                externalData.concat(",");
                                            }

                                        externalData.concat(String::format("{\"%s\":%s}",
                                                                           address.ToString().c_str(),
                                                                           floatToString(externalTemperature).c_str()));
                                    }
                            }
                    }
            }
    }

    //
    // Publish data
    //

    String const publishedData = String::format("{\"ts\":%u,\"temp\":%s,\"humidity\":%s,\"external\":[%s]}",
                                                Time.now(),
                                                floatToString(temperature).c_str(),
                                                floatToString(humidity).c_str(),
                                                externalData.c_str());

    Particle.publish("reading", publishedData, 60 /* TTL, unused */, PRIVATE);
    Serial.println(publishedData.c_str());

    delay(5 * 1000);
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