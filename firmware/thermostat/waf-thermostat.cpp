#include <Particle.h>

#include <math.h>
#include <Adafruit_DHT.h>
#include <OneWire.h>

#include "waf-helpers.h"
#include "waf-ds18b20.h"

//
// Particle configuration
//

PRODUCT_ID(8773);
PRODUCT_VERSION(1); // Increment for each release


//
// Globals
//

// Connect pin 1 (on the left) of the sensor to +5V
// Connect pin 2 of the sensor to whatever your DHTPIN is
// Connect pin 4 (on the right) of the sensor to GROUND
// Connect a 10K resistor from pin 2 (data) to pin 1 (power) of the sensor

DHT dht(2 /* Pin */, DHT22 /* Type */);
WafOneWire oneWire(D5); // OneWire bus attached to D5

//
// Setup
//

void setup() 
{
	dht.begin();
    oneWire.Initialize();
}

//
// Loop
//

void loop() 
{
    // Acquire data

    // Note: Reading temperature or humidity takes about 250 milliseconds
	float const temperature = dht.getTempCelcius();
	float const humidity = dht.getHumidity();

    String externalData;
    {   
        for (uint8_t idxDevice = 0; idxDevice < oneWire.DeviceCount(); ++idxDevice)
        {
            // Acquire temperature reading
            WafOneWireAddress const* const deviceAddress = oneWire.GetDeviceAddress(idxDevice);
            
            if (deviceAddress && deviceAddress->Address[0] == 0x28) // Ensure device exists and is a DS18B20 sensor
            {
                float const externalTemperature = oneWire.ReadDS18B20Temperature_Celsius(*deviceAddress);
                
                if (!isnan(externalTemperature))
                {
                    if (externalData.length() > 0)
                    {
                        externalData.concat(",");
                    }
                    
                    externalData.concat(
                        String::format(
                            "{\"%s\":%s}", 
                            deviceAddress->ToString().c_str(),
                            floatToString(externalTemperature).c_str()
                        )
                    );
                }
            }
        }
    }
	
    Particle.publish(
        "reading", 
        String::format(
            "{\"ts\":%u,\"temp\":%s,\"humidity\":%s,\"external\":[%s]}", 
            Time.now(), 
            floatToString(temperature).c_str(), 
            floatToString(humidity).c_str(), 
            externalData.c_str()), 
        60 /* TTL, unused */, 
        PRIVATE);

	delay(5 * 1000);
}
