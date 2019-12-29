#pragma once

#include <Particle.h>

#include "OneWireCRC.h"

class OneWireAddress
{
private:
    static uint8_t constexpr sc_cAddressBytes = 8;

public:
    OneWireAddress()
        : m_Address()
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

    bool IsEqual(OneWireAddress const& rhs) const
    {
        return memcmp(m_Address, rhs.m_Address, sizeof(m_Address)) == 0;
    }

    bool IsEmpty() const
    {
        OneWireAddress emptyAddress;
        return IsEqual(emptyAddress);
    }

    bool IsValid() const
    {
        return IsValid(m_Address);
    }


    static size_t constexpr sc_cchAsHexString_WithTerminator = (sc_cAddressBytes * 2) + 1;

    void ToString(char rgBuffer[sc_cchAsHexString_WithTerminator]) const
    {
        auto toHexChar = [](uint8_t const v) -> char { return (v < 0xA) ? (v + '0') : ((v - 0xA) + 'A'); };

        // LSB...MSB
        for (size_t idxByte = 0; idxByte < countof(m_Address); ++idxByte)
        {
            uint8_t const lowerNibble = m_Address[idxByte] & 0xF;
            uint8_t const upperNibble = m_Address[idxByte] >> 4;

            rgBuffer[2 * idxByte + 0] = toHexChar(upperNibble);
            rgBuffer[2 * idxByte + 1] = toHexChar(lowerNibble);
        }

        rgBuffer[sc_cchAsHexString_WithTerminator - 1] = 0;
    }

    bool FromString(char const* rgBuffer)
    {
        if (strlen(rgBuffer) != 2 * sc_cAddressBytes)
        {
            return false;
        }

        uint8_t constexpr c_InvalidCharacter = static_cast<uint8_t>(-1);

        auto fromHexChar = [](char const c) -> uint8_t {
            if ((c >= '0') && (c <= '9'))
            {
                return c - '0';
            }

            if ((c >= 'A') && (c <= 'F'))
            {
                return c - 'A' + 0xA;
            }

            if ((c >= 'a') && (c <= 'f'))
            {
                return c - 'a' + 0xA;
            }

            return c_InvalidCharacter;
        };

        // LSB...MSB
        uint8_t rgAddress[sc_cAddressBytes];

        for (size_t idxByte = 0; idxByte < countof(m_Address); ++idxByte)
        {
            uint8_t const upperNibble = fromHexChar(rgBuffer[2 * idxByte + 0]);
            uint8_t const lowerNibble = fromHexChar(rgBuffer[2 * idxByte + 1]);

            if ((upperNibble == c_InvalidCharacter) || (lowerNibble == c_InvalidCharacter))
            {
                return false;
            }

            rgAddress[idxByte] = lowerNibble | (upperNibble << 4);
        }

        if (!IsEmpty() && !IsValid(rgAddress))
        {
            return false;
        }

        // Commit
        memcpy(m_Address, rgAddress, sizeof(m_Address));
        return true;
    }

private:
    uint8_t m_Address[sc_cAddressBytes];

    static bool IsValid(uint8_t const rgAddress[sc_cAddressBytes])
    {
        return (OneWireCRC::Compute(rgAddress, sc_cAddressBytes - 1) == rgAddress[sc_cAddressBytes - 1]);
    }
};

inline bool operator==(OneWireAddress const& lhs, OneWireAddress const& rhs)
{
    return lhs.IsEqual(rhs);
}

inline bool operator!=(OneWireAddress const& lhs, OneWireAddress const& rhs)
{
    return !lhs.IsEqual(rhs);
}