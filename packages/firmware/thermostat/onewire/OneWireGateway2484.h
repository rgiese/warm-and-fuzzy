#pragma once

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
