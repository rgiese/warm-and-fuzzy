#pragma once

//
// Inspired by https://github.com/zeromq/libzmq/blob/8cda54c52b08005b71f828243f22051cdbc482b4/src/zmq_utils.cpp
//
// Compatible with both the conventional Z85 dictionary as well as our slightly modified version
// (see comment in //packages/api/src/shared/Z85.ts)
//

namespace Z85
{
namespace
{
static uint8_t const sc_decoderRingBaseValue = 32;

static uint8_t const sc_rgDecoderRing[96] = {
    0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00, 0x4B, 0x4C, 0x46, 0x41, 0x48, 0x3F, 0x3E, 0x45,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47,
    0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
    0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00,
    0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
    0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00};

static char const sc_rgEncoderRing[] =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?,<>()[]{}@%$#";

}  // namespace

// @returns count of decoded (destination) bytes
inline uint16_t DecodeBytes(uint8_t* const rgDestination,
                            uint16_t const cbDestination,
                            char const* const rgSource,
                            uint16_t const cchSource)
{
    if (cchSource % 5 != 0)
    {
        // Encoded data must be a multiple of five so something went squishy here
        return 0;
    }

    size_t const cbDestinationRequired = (cchSource / 5) * 4;

    if (cbDestinationRequired > cbDestination)
    {
        // Since our caller can't reallocate its buffer anyhow,
        // don't bother with the "return required bytes" API song and dance
        return 0;
    }

    uint32_t* pDestination = reinterpret_cast<uint32_t*>(rgDestination);
    uint32_t accumulator = 0;

    for (size_t idxSource = 0; idxSource < cchSource; ++idxSource)
    {
        // Accumulate value in base 85
        uint8_t sourceValueMinusBase = static_cast<uint8_t>(rgSource[idxSource]) - sc_decoderRingBaseValue;

        if (sourceValueMinusBase > countof(sc_rgDecoderRing))
        {
            // Invalid input
            return 0;
        }

        accumulator = accumulator * 85 + sc_rgDecoderRing[sourceValueMinusBase];

        if ((idxSource + 1) % 5 == 0)
        {
            // Emit completed value
            *pDestination = __builtin_bswap32(accumulator);
            ++pDestination;

            accumulator = 0;
        }
    }

    return static_cast<uint16_t const>(cbDestinationRequired);  // cast valid by check against cbDestination
}

// @returns count of encoded (destination) characters (without terminator). rgDestination is zero-terminated.
inline uint16_t EncodeBytes(char* const rgDestination,
                            uint16_t const cchDestination,
                            uint8_t const* const rgSource,
                            uint16_t const cbSource)
{
    size_t const cchDestinationRequired = ((cbSource + 3) / 4) * 5 + 1 /* terminator */;  // == ceil(cbSource/4) * 5 + 1

    if (cchDestinationRequired > cchDestination)
    {
        // Since our caller can't reallocate its buffer anyhow,
        // don't bother with the "return required bytes" API song and dance
        return 0;
    }

    uint32_t accumulator = 0;
    uint8_t cbAccumulated = 0;

    char* pDestination = rgDestination;

    auto accumulateByte = [&](uint8_t const currentValue) {
        accumulator = ((accumulator << 8) | currentValue);
        ++cbAccumulated;

        if (cbAccumulated % 4 == 0)
        {
            uint32_t divisor = 85 * 85 * 85 * 85;

            while (divisor >= 1)
            {
                uint8_t const idxEncoderRing = static_cast<uint8_t>((accumulator / divisor) % 85);
                char const encodedCharacter = sc_rgEncoderRing[idxEncoderRing];

                *pDestination = encodedCharacter;
                ++pDestination;

                divisor /= 85;
            }

            accumulator = 0;
        }
    };

    for (uint16_t idxSource; idxSource < cbSource; ++idxSource)
    {
        accumulateByte(rgSource[idxSource]);
    }

    while (cbAccumulated % 4)
    {
        accumulateByte(0);
    }

    *pDestination = 0;
    return cchDestinationRequired - 1;
}

}  // namespace Z85