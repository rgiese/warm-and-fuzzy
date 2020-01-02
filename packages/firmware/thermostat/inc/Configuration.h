#pragma once

typedef Flatbuffers::Firmware::ThermostatAction ThermostatAction;

//
// A note on EEPROM emulation on Particle devices:
// (c.f. https://github.com/particle-iot/device-os/blob/develop/services/inc/eeprom_emulation.h)
//
// The Device OS virtualizes EEPROM on top of Flash;
// as such, reads are cheap, append-writes are semi-expensive, and erases (overwrites) are quite expensive.
//
// Each individual byte of virtualized EEPROM is thus stored as a tuple of [virtualized address, value],
// allowing the Device OS to append tuples with updated values for a given virtual address without having to
// erase flash every time there's a write.
//
// If the number of updates exceeds the capacity of a given flash page,
// a second flash page is erased and the (old) page's content is copy/compacted into the new page.
//
// EEPROM.put(T) will only save changed bytes rather than the entire T, requiring a small amount of read/diff work
// every time it's called (while also making a dynamic allocation).
//
// Our implementation relies on the Device OS's de-duplicating feature so anytime we update,
// we'll just EEPROM.put(T) the entire Configuration structure.
//

//
// A note on threading:
//
// .Configuration() should be read only on the main thread, where it is always safe to read and not subject to any
// tearing.
//

class Configuration
{
public:
    Configuration()
        : m_Data()
        , m_pConfiguration()
        , m_cbPendingData()
        , m_rgPendingData()
        , m_UpdateMutex()
    {
    }

    ~Configuration()
    {
    }

    Configuration(Configuration const&) = delete;
    Configuration& operator=(Configuration const&) = delete;

public:
    //
    // Accessor
    //

    Flatbuffers::Firmware::ThermostatConfiguration const& rootConfiguration() const
    {
        return *m_pConfiguration;
    }

    static float getTemperature(uint16_t const temperature_x100)
    {
        return temperature_x100 / 100.0f;
    }

    //
    // Operations
    //

    void Initialize()
    {
        // Load header from EEPROM
        EEPROM.get(sc_EEPROMAddress, m_Data);

        // Header checks
        if (m_Data.Header.Signature != ConfigurationHeader::sc_Signature)
        {
            LoadDefaults();
        }
        else if (m_Data.Header.Version != ConfigurationHeader::sc_CurrentVersion)
        {
            LoadDefaults();
        }
        else if (!m_Data.cbFlatbufferData || (m_Data.cbFlatbufferData > sizeof(m_Data.rgFlatbufferData)))
        {
            LoadDefaults();
        }

        // Payload checks
        {
            flatbuffers::Verifier verifier(m_Data.rgFlatbufferData, m_Data.cbFlatbufferData);
            if (!Flatbuffers::Firmware::VerifyThermostatConfigurationBuffer(verifier))
            {
                LoadDefaults();
            }
        }

        // Mount Flatbuffer data for reading
        m_pConfiguration = Flatbuffers::Firmware::GetThermostatConfiguration(m_Data.rgFlatbufferData);
    }

    enum class ConfigUpdateResult
    {
        Retained,
        Accepted,
        Invalid,
    };

    ConfigUpdateResult SubmitUpdate(uint8_t const* const rgConfigurationData, uint16_t const cbConfigurationData)
    {
        LockGuard autoLock(m_UpdateMutex);

        // Mark buffer as empty
        m_cbPendingData = 0;

        // Decode into buffer
        uint16_t const cbPendingData =
            Z85::DecodeBytes(m_rgPendingData, sizeof(m_rgPendingData), rgConfigurationData, cbConfigurationData);

        if (!cbPendingData)
        {
            Serial.println("!! Z85::Decode rejected configuration text");
            return ConfigUpdateResult::Invalid;
        }

        // Validate flatbuffer
        flatbuffers::Verifier verifier(m_rgPendingData, cbPendingData);
        if (!Flatbuffers::Firmware::VerifyThermostatConfigurationBuffer(verifier))
        {
            Serial.println("!! Couldn't verify new configuration flatbuffer");
            return ConfigUpdateResult::Invalid;
        }

        // Check if config has changed
        if (cbPendingData == m_Data.cbFlatbufferData &&
            memcmp(m_rgPendingData, m_Data.rgFlatbufferData, cbPendingData) == 0)
        {
            return ConfigUpdateResult::Retained;
        }

        // Commit changing buffer
        m_cbPendingData = cbPendingData;

        return ConfigUpdateResult::Accepted;
    }

    bool AcceptPendingUpdates()
    {
        LockGuard autoLock(m_UpdateMutex);

        if (!HasPendingUpdates())
        {
            // Nothing to do
            return false;
        }

        // Copy data (should have been pre-verified on all fronts)
        memcpy(m_Data.rgFlatbufferData, m_rgPendingData, m_cbPendingData);
        m_Data.cbFlatbufferData = m_cbPendingData;

        // Persist data
        EEPROM.put(sc_EEPROMAddress, m_Data);

        // Re-mount Flatbuffer data for reading
        m_pConfiguration = Flatbuffers::Firmware::GetThermostatConfiguration(m_Data.rgFlatbufferData);

        // Clear pending data
        m_cbPendingData = 0;

        return true;
    }

    bool HasPendingUpdates() const
    {
        LockGuard autoLock(m_UpdateMutex);

        return !!m_cbPendingData;
    }

    //
    // Debugging
    //

    void PrintConfiguration() const
    {
        char szExternalSensorId[OneWireAddress::sc_cchAsHexString_WithTerminator];
        OneWireAddress externalSensorId(rootConfiguration().externalSensorId());

        externalSensorId.ToString(szExternalSensorId);

        Serial.printlnf(
            "SetPoints = %.1f C (heat) / %.1f C (cool), Threshold = +/-%.1f C, Cadence = %u sec, AllowedActions = "
            "[%c%c%c], ExternalSensorId = %s",
            Configuration::getTemperature(rootConfiguration().setPointHeat_x100()),
            Configuration::getTemperature(rootConfiguration().setPointCool_x100()),
            Configuration::getTemperature(rootConfiguration().threshold_x100()),
            rootConfiguration().cadence(),
            !!(rootConfiguration().allowedActions() & Flatbuffers::Firmware::ThermostatAction::Heat) ? 'H' : '_',
            !!(rootConfiguration().allowedActions() & Flatbuffers::Firmware::ThermostatAction::Cool) ? 'C' : '_',
            !!(rootConfiguration().allowedActions() & Flatbuffers::Firmware::ThermostatAction::Circulate) ? 'R' : '_',
            szExternalSensorId);
    }

private:
    typedef std::recursive_mutex Mutex;
    typedef std::lock_guard<Mutex> LockGuard;

    struct ConfigurationHeader
    {
        uint16_t Signature;
        uint16_t Version;

        ConfigurationHeader()
            : Signature()
            , Version()
        {
        }

        static constexpr uint16_t sc_Signature = 0x8233;
        static constexpr uint16_t sc_CurrentVersion = 3;
    };

    static constexpr uint16_t sc_cbFlatbufferData_Max = 256;

    struct ConfigurationData
    {
        ConfigurationHeader Header;

        //
        // Flatbuffers will lay out their data structures with correct alignment;
        // we just need to make sure the base of the Flatbuffer data is correctly aligned
        // -> alignas() below.
        //

        uint16_t cbFlatbufferData;
        alignas(alignof(uint64_t)) uint8_t rgFlatbufferData[sc_cbFlatbufferData_Max];

        ConfigurationData()
            : Header()
            , cbFlatbufferData()
            , rgFlatbufferData()
        {
        }
    };

    static constexpr int sc_EEPROMAddress = 0;

    // Readable state
    ConfigurationData m_Data;
    Flatbuffers::Firmware::ThermostatConfiguration const* m_pConfiguration;

    // Pending (to be ingested and written out) state
    uint16_t m_cbPendingData;
    uint8_t m_rgPendingData[sc_cbFlatbufferData_Max];

    // Protects pending state (readable state is always good to read)
    mutable Mutex m_UpdateMutex;

private:
    void LoadDefaults()
    {
        Serial.println("-- Resetting configuration to defaults");

        // Build flatbuffer with default values
        flatbuffers::FlatBufferBuilder flatbufferBuilder(sizeof(m_Data.rgFlatbufferData));
        {
            auto const rootConfiguration = Flatbuffers::Firmware::CreateThermostatConfiguration(flatbufferBuilder);
            Flatbuffers::Firmware::FinishThermostatConfigurationBuffer(flatbufferBuilder, rootConfiguration);
        }

        // Verify size and casting limits
        if (flatbufferBuilder.GetSize() > sizeof(m_Data.rgFlatbufferData))
        {
            Serial.printlnf("Default configuration size of %u exceeds limits. Bailing.", flatbufferBuilder.GetSize());

            delay(60 * 1000);
            System.reset();
        }

        // Commit data to RAM
        m_Data.Header.Signature = ConfigurationHeader::sc_Signature;
        m_Data.Header.Version = ConfigurationHeader::sc_CurrentVersion;

        memcpy(m_Data.rgFlatbufferData, flatbufferBuilder.GetBufferPointer(), flatbufferBuilder.GetSize());
        m_Data.cbFlatbufferData = static_cast<uint16_t>(flatbufferBuilder.GetSize());

        // Don't bother committing default data to EEPROM
        // - we'll just overwrite it when we get an updated configuration or reload defaults on the next power cycle.
    }
};