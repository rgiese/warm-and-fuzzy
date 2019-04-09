#pragma once

#include <Particle.h>

#include "OneWireAddress.h"

class IOneWireGateway
{
   public:
    // Constants
    enum class OneWireCommand : uint8_t
    {
        // All devices
        ReadROM = 0x33,
        MatchROM = 0x55,
        SkipROM = 0xCC,
        SearchAll = 0xF0,
        SearchAlarmed = 0xEC,

        // Temperature sensors
        ConvertT = 0x44,
        ReadScratchpad = 0xBE,
    };

   public:
    // Interface
    virtual bool Initialize() = 0;

    virtual bool Reset() const = 0;
    virtual bool ReadByte(__out uint8_t& Value) const = 0;
    virtual bool WriteByte(uint8_t const Value) const = 0;

    virtual bool EnumerateDevices(std::function<void(OneWireAddress const&)> OnAddress) const = 0;

   public:
    // Convenience helpers
    bool WriteCommand(OneWireCommand const Command) const
    {
        return WriteByte(static_cast<uint8_t>(Command));
    }

    bool WriteBytes(uint8_t const rgValues[], uint8_t const cValues) const
    {
        for (uint8_t idxValue = 0; idxValue < cValues; ++idxValue)
        {
            if (!WriteByte(rgValues[idxValue]))
            {
                return false;
            }
        }

        return true;
    }

    bool SelectAddress(OneWireAddress const& Address) const
    {
        if (!WriteCommand(OneWireCommand::MatchROM))
        {
            return false;
        }

        return WriteBytes(Address.Get(), 8);
    }
};
