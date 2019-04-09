#pragma once

#include <Particle.h>

#include "OneWireCRC.h"

class OneWireAddress
{
   public:
    OneWireAddress() : m_Address()
    {
    }

    void SetBit(size_t idxBit, bool IsSet)
    {
        if (idxBit >= 8 * countof(m_Address))
        {
            return;
        }

        size_t const idxByte = idxBit / 8;
        size_t const idxBitInByte = idxBit % 8;

        uint8_t const existingValue = m_Address[idxByte];
        uint8_t const existingValue_BitCleared = existingValue & static_cast<uint8_t>(~(1 << idxBitInByte));

        m_Address[idxByte] = existingValue_BitCleared | (static_cast<uint8_t>(!!IsSet) << idxBitInByte);
    }

    bool GetBit(size_t idxBit) const
    {
        if (idxBit >= 8 * countof(m_Address))
        {
            return false;
        }

        size_t const idxByte = idxBit / 8;
        size_t const idxBitInByte = idxBit % 8;

        return ((m_Address[idxByte] >> idxBitInByte) & 0x1);
    }

    uint8_t GetByte(size_t idxByte) const
    {
        if (idxByte >= countof(m_Address))
        {
            return 0;
        }

        return m_Address[idxByte];
    }

    uint8_t const* Get() const
    {
        return m_Address;
    }

    uint8_t GetDeviceFamily() const
    {
        return m_Address[0];
    }

    bool IsValid() const
    {
        return (OneWireCRC::Compute(m_Address, countof(m_Address) - 1) == m_Address[countof(m_Address) - 1]);
    }

    String ToString() const
    {
        String str;

        // LSB...MSB
        for (size_t idxByte = 0; idxByte < countof(m_Address); ++idxByte)
        {
            str.concat(String::format("%02x", m_Address[idxByte]));
        }

        return str;
    }

   private:
    uint8_t m_Address[8];
};
