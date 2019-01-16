#pragma once

#include <Particle.h>
#include <OneWire.h>

struct WafOneWireAddress
{
    uint8_t Address[8];
    
    String ToString() const
    {
        String str;
        
        for (int idxByte = 0; idxByte < 8; ++idxByte)
        {
            str.concat(String::format("%02x", (int) this->Address[idxByte])); // Sadness
        }
        
        return str;
    }
};

class WafOneWire
{
public:
    WafOneWire(uint16_t busPin)
        : oneWireBus(busPin)
        , cDevices(0)
    {
    }
    
    void Initialize()
    {
        // Scan OneWire bus for device addresses
        oneWireBus.reset_search();
        
        for (cDevices = 0; cDevices < cDevices_Max; ++cDevices)
        {
            uint8_t* const rgCurrentAddress = rgAddresses[cDevices].Address;
            
            uint8_t const fFoundDevice = oneWireBus.search(rgCurrentAddress);
            
            if (fFoundDevice == 0)
            {
                // No further devices
                break;
            }
            
            if (OneWire::crc8(rgCurrentAddress, 7) != rgCurrentAddress[7]) 
            {
                // CRC not valid - skip
                --cDevices;
                continue;
            }        
        }        
    }
    
    uint8_t DeviceCount() const
    {
        return cDevices;
    }
    
    WafOneWireAddress const* GetDeviceAddress(uint8_t const idxDevice) const
    {
        if (idxDevice >= cDevices)
        {
            return NULL;
        }
        
        return &rgAddresses[idxDevice];
    }
    
    float ReadDS18B20Temperature_Celsius(WafOneWireAddress const& Address) const
    {
        // Tell device to start conversion    
        oneWireBus.reset();
        oneWireBus.select(Address.Address);

        oneWireBus.write(0x44 /* start conversion */);
        
        HAL_Delay_Milliseconds(800); // Should suffice for 12-bit conversion (750ms)

        // Request scratchpad read
        oneWireBus.reset();
        oneWireBus.select(Address.Address);

        oneWireBus.write(0xBE);

        // Read nine bytes
        uint8_t rgScratchPad[9];
        
        for (uint8_t idx = 0; idx < countof(rgScratchPad); ++idx)
        {
            rgScratchPad[idx] = oneWireBus.read();
        }

        if (OneWire::crc8(rgScratchPad, 8) != rgScratchPad[8])
        {
            // CRC validation failed
            return NAN;
        }

        // Convert data to actual temperature
        int16_t rawValue = (rgScratchPad[1] << 8) | rgScratchPad[0];

        if (Address.Address[0] == 0x10) // DS1820 (no 'B')
        {
            rawValue = rawValue << 3; // 9 bit resolution default

            if (rgScratchPad[7] == 0x10)
            {
                // "count remain" gives full 12 bit resolution
                rawValue = (rawValue & 0xFFF0) + 12 - rgScratchPad[6];
            }
        }
        else
        {
            uint8_t const config = (rgScratchPad[4] & 0x60);

            // At lower resolutions the low bits are undefined so let's zero them
            switch (config)
            {
                case 0x00:
                    rawValue = rawValue & ~7;  // 9 bit resolution, 93.75ms conversion time
                    break;
                    
                case 0x20:
                    rawValue = rawValue & ~3; // 10 bit resolution, 187.5ms conversion time
                    break;
                    
                case 0x40:
                    rawValue = rawValue & ~1; // 11 bit resolution, 375ms conversion time
                    break;
                    
                case 0x60: // 12 bit resolution, 750ms conversion time, no fix-ups needed
                    break;
                    
                default: // Something's off - bail
                    return NAN;
            }
        }

        return static_cast<float>(rawValue) / 16.0f;
    }
    
    
private:
    mutable OneWire oneWireBus;

    static int const cDevices_Max = 8;
    WafOneWireAddress rgAddresses[cDevices_Max];
    int cDevices;
};