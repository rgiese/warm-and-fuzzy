#pragma once

#include "../inc/coredefs.h"
#include "IOneWireGateway.h"

class OneWireGateway2484 : public IOneWireGateway
{
public:
    OneWireGateway2484();

public:
    virtual bool Initialize();

    virtual bool Reset() const;
    virtual bool ReadByte(__out uint8_t& Value) const;
    virtual bool WriteByte(uint8_t const Value) const;

    virtual bool EnumerateDevices(std::function<void(OneWireAddress const&)> OnAddress) const;

private:
    static uint8_t const sc_GatewayAddress = 0x18;

    enum class GatewayCommand : uint8_t
    {
        DeviceReset = 0xF0,
        SetReadPointer = 0xE1,
        WriteDeviceConfiguration = 0xD2,
        OneWireReset = 0xB4,
        OneWireWriteByte = 0xA5,
        OneWireReadByte = 0x96,
        OneWireTriplet = 0x78,
    };

    enum class GatewayRegister : uint8_t
    {
        Unknown = 0x00,
        DeviceConfiguration = 0xC3,
        Status = 0xF0,
        ReadData = 0xE1,
        PortConfiguration = 0xB4,
    };

    union GatewayConfiguration
    {
        uint8_t Value;

        struct  // lowest bit to highest
        {
            uint8_t ActivePullup : 1;    // Generally recommended for best OneWire bus performance
            uint8_t PowerDown : 1;       // Remove power from OneWire bus
            uint8_t StrongPullup : 1;    // Strong pull-up to transiently provide greater bus power
            uint8_t OverdriveSpeed : 1;  // Overdrive speed on OneWire bus
        };
    };

    union GatewayStatus
    {
        uint8_t Value;

        struct  // lowest bit to highest
        {
            uint8_t OneWireIsBusy : 1;
            uint8_t PresencePulseDetected : 1;
            uint8_t ShortDetected : 1;
            uint8_t LogicLevel : 1;
            uint8_t DeviceHasBeenReset : 1;
            uint8_t SingleBitResult : 1;
            uint8_t TripletSecondBit : 1;
            uint8_t TripletBranchDirectionTaken : 1;
        };
    };

private:
    mutable GatewayRegister m_LatestReadPointer;

private:
    bool ReadGatewayRegister(__out uint8_t& Value, GatewayRegister const Register) const;
    bool SetGatewayConfiguration(GatewayConfiguration const Configuration) const;

    bool WaitForOneWireIdle(__out_opt GatewayStatus* latestStatus = NULL) const;
    bool Triplet(__out bool& FirstBit,
                 __out bool& SecondBit,
                 __out bool& DirectionTaken,
                 uint8_t const DirectionRequested) const;

private:
    // Internal helpers for single-byte writes
    void _writeGatewayData(uint8_t Data) const
    {
        Wire.write(Data);
    }

    void _writeGatewayData(GatewayCommand Command) const
    {
        _writeGatewayData(static_cast<uint8_t>(Command));
    }

    void _writeGatewayData(GatewayRegister Register) const
    {
        _writeGatewayData(static_cast<uint8_t>(Register));
    }

    // Internal helper for multi-byte unroll
    template <typename T, typename... PayloadT>
    void _writeGatewayData(T Data, PayloadT... Remainder) const
    {
        _writeGatewayData(Data);
        _writeGatewayData(Remainder...);
    }

    // Write function
    template <typename... PayloadT>
    bool WriteGatewayCommand(GatewayCommand const Command, PayloadT... Payload) const
    {
        // Write data
        Wire.beginTransmission(sc_GatewayAddress);
        _writeGatewayData(Command, Payload...);
        byte const status = Wire.endTransmission();

        // Check for success
        if (status != 0)
        {
            m_LatestReadPointer = GatewayRegister::Unknown;
            return false;
        }

        // Infer latest read pointer from command type
        // (caching this improves enumeration performance ~25%)
        switch (Command)
        {
            case GatewayCommand::DeviceReset:
                m_LatestReadPointer = GatewayRegister::Status;
                break;

            case GatewayCommand::SetReadPointer:
                m_LatestReadPointer = GatewayRegister::Unknown;  // caller needs to set
                break;

            case GatewayCommand::WriteDeviceConfiguration:
                m_LatestReadPointer = GatewayRegister::DeviceConfiguration;
                break;

            case GatewayCommand::OneWireReset:
            case GatewayCommand::OneWireWriteByte:
            case GatewayCommand::OneWireReadByte:
            case GatewayCommand::OneWireTriplet:
                m_LatestReadPointer = GatewayRegister::Status;
                break;

            default:
                m_LatestReadPointer = GatewayRegister::Unknown;
                break;
        }

        return true;
    }
};

//
// Interface implementation
//

OneWireGateway2484::OneWireGateway2484()
    : m_LatestReadPointer(GatewayRegister::Unknown)
{
}

bool OneWireGateway2484::Initialize()
{
    // Set up I2C
    Wire.setSpeed(CLOCK_SPEED_400KHZ);
    Wire.begin();

    // Reset gateway
    RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::DeviceReset));

    // Set device configuration
    GatewayConfiguration config;
    config.ActivePullup = 1;

    RETURN_IF_FALSE(SetGatewayConfiguration(config));

    return true;
}

bool OneWireGateway2484::Reset() const
{
    RETURN_IF_FALSE(WaitForOneWireIdle());
    RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::OneWireReset));
    RETURN_IF_FALSE(WaitForOneWireIdle());

    return true;
}

bool OneWireGateway2484::ReadByte(__out uint8_t& Value) const
{
    RETURN_IF_FALSE(WaitForOneWireIdle());
    RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::OneWireReadByte));
    RETURN_IF_FALSE(WaitForOneWireIdle());

    RETURN_IF_FALSE(ReadGatewayRegister(Value, GatewayRegister::ReadData));

    return true;
}

bool OneWireGateway2484::WriteByte(uint8_t const Value) const
{
    RETURN_IF_FALSE(WaitForOneWireIdle());
    RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::OneWireWriteByte, Value));
    RETURN_IF_FALSE(WaitForOneWireIdle());

    return true;
}

bool OneWireGateway2484::EnumerateDevices(std::function<void(OneWireAddress const&)> OnAddress) const
{
    //
    // For a description of the OneWire enumeration process, see Maxim AN 187
    // at https://www.maximintegrated.com/en/app-notes/index.mvp/id/187.
    //
    // In broad strokes, we reset the bus and issue an enumeration command.
    // Every device on the bus reports the lowest bit of their address
    // by value (`firstBit`) and complement (`secondBit`),
    // allowing us to detect whether multiple devices reported conflicting values
    // for that bit.
    //
    // If the values conflict, we march on in an arbitrarily chosen default direction
    // and remember that we had a conflict at this bit index
    // (wherein "marching on" means sending out a confirmation of the chosen bit value to the devices;
    //  any device whose address disagrees with that bit value drops out of the process until we reset the bus).
    //
    // If the values don't conflict, we save the returned bit and repeat the process for the next bit.
    //
    // Once we've cycled through all 64 bits in a full address,
    // we restart the process if a conflict was detected and choose a different path
    // at the point of conflict.
    //
    uint8_t const c_NotSet = static_cast<uint8_t>(-1);

    OneWireAddress address;
    uint8_t idxPreviousRound_LatestConflictingBit = c_NotSet;

    for (size_t idxAttempt = 0; idxAttempt < 32; ++idxAttempt)  // safeguard against runaway conditions
    {
        uint8_t idxLatestConflictingBit = c_NotSet;

        // Reset bus
        Reset();

        // Check if any devices are present from presence pulse after bus reset
        if (idxAttempt == 0)
        {
            GatewayStatus status;
            RETURN_IF_FALSE(ReadGatewayRegister(status.Value, GatewayRegister::Status));

            if (!status.PresencePulseDetected)
            {
                return false;
            }
        }

        // Issue search command
        RETURN_IF_FALSE(WriteCommand(OneWireCommand::SearchAll));

        for (uint8_t idxBit = 0; idxBit < 64; ++idxBit)
        {
            bool const c_DefaultDirectionOnConflict = false;

            bool const directionOnConflict =
                // If there was no previous conflict...
                (idxPreviousRound_LatestConflictingBit == c_NotSet)
                    ? c_DefaultDirectionOnConflict  // ...move in the default direction.
                    // If we're at a bit prior to a previously conflicting bit...
                    : (idxBit < idxPreviousRound_LatestConflictingBit)
                          ? address.GetBit(idxBit)  // ...follow the same path as before.
                          // If we're at the site of the previously conflicting bit...
                          : (idxBit == idxPreviousRound_LatestConflictingBit)
                                ? !c_DefaultDirectionOnConflict  // ...choose a different path;
                                : c_DefaultDirectionOnConflict;  // otherwise, choose the default direction
                                                                 // again.

            // The triplet operation will evaluate the retrieved bit/complement-bit values
            // for the current address bit and send out a direction bit as follows:
            //   0, 0: a mix of zeros and ones in the participating ROM IDs -> write requested direction bit
            //   0, 1: there are only zeros in the participating ROM IDs -> auto-write zero
            //   1, 0: there are only ones in the participating ROM IDs -> auto-write one
            //   1, 1: invalid condition -> auto-write one
            bool firstBit;
            bool secondBit;
            bool directionTaken;
            {
                RETURN_IF_FALSE(Triplet(firstBit, secondBit, directionTaken, directionOnConflict));
            }

            if (firstBit && secondBit)
            {
                // Invalid condition (device must have gone missing, given initial presence pulse check),
                // abort search
                return false;
            }
            else if (firstBit == !secondBit)
            {
                // No conflict -> accept bit
                address.SetBit(idxBit, firstBit);
            }
            else
            {
                // Conflict -> accept bit from direction taken (should be the same as `directionOnConflict`
                // above)
                address.SetBit(idxBit, directionTaken);

                // Verify internal consistency
                if (directionTaken != directionOnConflict)
                {
                    return false;
                }

                // Remember we saw a conflict if we moved in the default direction (otherwise we don't need
                // to revisit)
                if (directionTaken == c_DefaultDirectionOnConflict)
                {
                    idxLatestConflictingBit = idxBit;
                }
            }
        }

        if (address.IsValid())
        {
            OnAddress(address);
        }

        if (idxLatestConflictingBit == c_NotSet)
        {
            // No conflicts detected -> done finding devices
            return true;
        }

        idxPreviousRound_LatestConflictingBit = idxLatestConflictingBit;
    }

    return false;  // Ran into runaway bounds
}


//
// Internals
//

bool OneWireGateway2484::ReadGatewayRegister(__out uint8_t& Value, GatewayRegister const Register) const
{
    // Set read pointer
    if (m_LatestReadPointer != Register)
    {
        RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::SetReadPointer, Register));
        m_LatestReadPointer = Register;
    }

    // Read
    uint8_t const cBytesAvailable = Wire.requestFrom(sc_GatewayAddress, static_cast<uint8_t>(1));
    RETURN_IF_FALSE(cBytesAvailable == 1);

    Value = Wire.read();
    return true;
}

bool OneWireGateway2484::SetGatewayConfiguration(GatewayConfiguration const Configuration) const
{
    // Send configuration
    {
        // DS2484 requires upper half of transmitted config value to be bitwise inverse of config bits
        uint8_t const sendableConfig = Configuration.Value | ((~Configuration.Value) << 4);
        RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::WriteDeviceConfiguration, sendableConfig));
    }

    // Verify configuration
    {
        uint8_t verifiedConfig;
        {
            RETURN_IF_FALSE(ReadGatewayRegister(verifiedConfig, GatewayRegister::DeviceConfiguration));
        }

        RETURN_IF_FALSE(verifiedConfig == Configuration.Value);
    }

    return true;
}

bool OneWireGateway2484::WaitForOneWireIdle(__out_opt GatewayStatus* latestStatus) const
{
    for (size_t idxSpin = 0; /* inline */; ++idxSpin)
    {
        GatewayStatus status;

        RETURN_IF_FALSE(ReadGatewayRegister(status.Value, GatewayRegister::Status));

        if (!status.OneWireIsBusy)
        {
            if (latestStatus)
            {
                *latestStatus = status;
            }

            return true;
        }

        // These delays are short enough (generally 0-3) that we'll just spin rather than delay for the first bunch
        // of rounds
        if (idxSpin > 10)
        {
            delayMicroseconds(100);
        }
    }
}

bool OneWireGateway2484::Triplet(__out bool& FirstBit,
                                 __out bool& SecondBit,
                                 __out bool& DirectionTaken,
                                 uint8_t const DirectionRequested) const
{
    GatewayStatus latestStatus;
    {
        RETURN_IF_FALSE(WaitForOneWireIdle());
        RETURN_IF_FALSE(WriteGatewayCommand(GatewayCommand::OneWireTriplet,
                                            static_cast<uint8_t>((DirectionRequested ? 1 : 0) << 7)));
        RETURN_IF_FALSE(WaitForOneWireIdle(&latestStatus));
    }

    FirstBit = latestStatus.SingleBitResult;
    SecondBit = latestStatus.TripletSecondBit;
    DirectionTaken = latestStatus.TripletBranchDirectionTaken;

    return true;
}
