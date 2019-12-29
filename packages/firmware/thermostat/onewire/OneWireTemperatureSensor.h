#pragma once

#include "IOneWireGateway.h"

class OneWireTemperatureSensor
{
public:
    // Fine-grained functions
    static bool RequestMeasurement(IOneWireGateway const& OneWireGateway)
    {
        // Reset bus
        RETURN_IF_FALSE(OneWireGateway.Reset());

        // Request bus-wide temperature conversion
        RETURN_IF_FALSE(OneWireGateway.WriteCommand(IOneWireGateway::OneWireCommand::SkipROM));
        RETURN_IF_FALSE(OneWireGateway.WriteCommand(IOneWireGateway::OneWireCommand::ConvertT));

        // Wait for conversion to complete
        delay(1000);

        return true;
    }

    static bool RequestMeasurement(OneWireAddress const& Address, IOneWireGateway const& OneWireGateway)
    {
        // Reset bus
        RETURN_IF_FALSE(OneWireGateway.Reset());

        // Request device-specific temperature conversion
        RETURN_IF_FALSE(OneWireGateway.SelectAddress(Address));
        RETURN_IF_FALSE(OneWireGateway.WriteCommand(IOneWireGateway::OneWireCommand::ConvertT));

        // Wait for conversion to complete
        delay(800);

        return true;
    }

    static bool RetrieveMeasurement(__out float& Celsius,
                                    OneWireAddress const& Address,
                                    IOneWireGateway const& OneWireGateway)
    {
        // Reset bus and select device by address
        RETURN_IF_FALSE(OneWireGateway.Reset());
        RETURN_IF_FALSE(OneWireGateway.SelectAddress(Address));

        // Request scratchpad data
        RETURN_IF_FALSE(OneWireGateway.WriteCommand(IOneWireGateway::OneWireCommand::ReadScratchpad));

        // Read scratchpad data
        uint8_t rgScratchpad[9];
        {
            for (size_t idxByte = 0; idxByte < countof(rgScratchpad); ++idxByte)
            {
                RETURN_IF_FALSE(OneWireGateway.ReadByte(rgScratchpad[idxByte]));
            }
        }

        if (OneWireCRC::Compute(rgScratchpad, countof(rgScratchpad) - 1) != rgScratchpad[countof(rgScratchpad) - 1])
        {
            return false;
        }

        // Convert data to actual temperature
        int16_t rawValue = (rgScratchpad[1] << 8) | rgScratchpad[0];

        if (Address.GetDeviceFamily() == 0x10)  // DS1820 (no 'B')
        {
            rawValue = rawValue << 3;  // 9 bit resolution default

            if (rgScratchpad[7] == 0x10)
            {
                // "count remain" gives full 12 bit resolution
                rawValue = (rawValue & 0xFFF0) + 12 - rgScratchpad[6];
            }
        }
        else
        {
            uint8_t const config = (rgScratchpad[4] & 0x60);

            // At lower resolutions the low bits are undefined so let's zero them
            switch (config)
            {
                case 0x00:
                    rawValue = rawValue & ~7;  // 9 bit resolution, 93.75ms conversion time
                    break;

                case 0x20:
                    rawValue = rawValue & ~3;  // 10 bit resolution, 187.5ms conversion time
                    break;

                case 0x40:
                    rawValue = rawValue & ~1;  // 11 bit resolution, 375ms conversion time
                    break;

                case 0x60:  // 12 bit resolution, 750ms conversion time, no fix-ups needed
                    break;

                default:  // Something's off - bail
                    return false;
            }
        }

        // Commit converted value
        Celsius = static_cast<float>(rawValue) / 16.0f;

        return true;
    }

    // All-in-one function
    static bool ReadTemperature(__out float& Celsius,
                                OneWireAddress const& Address,
                                IOneWireGateway const& OneWireGateway)
    {
        // Request measurement
        RETURN_IF_FALSE(RequestMeasurement(Address, OneWireGateway));

        // Retrieve measurement
        RETURN_IF_FALSE(RetrieveMeasurement(Celsius, Address, OneWireGateway));

        return true;
    }
};
