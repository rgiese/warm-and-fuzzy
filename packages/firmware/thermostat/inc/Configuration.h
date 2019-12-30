#pragma once

#include <Particle.h>

#include <mutex>

#include "../generated/firmware_generated.h"
#include "../onewire/OneWireAddress.h"

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
        , m_PendingData()
        , m_Mutex()
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

        uint16_t const cbFlatbufferData = m_Data.Header.cbData - sizeof(ConfigurationHeader);

        // Header checks
        if (m_Data.Header.Signature != ConfigurationHeader::sc_Signature)
        {
            LoadDefaults();
        }
        else if (m_Data.Header.Version != ConfigurationHeader::sc_CurrentVersion)
        {
            LoadDefaults();
        }
        else if ((m_Data.Header.cbData < sizeof(ConfigurationHeader)) ||
                 (cbFlatbufferData > ConfigurationData::sc_cbFlatbufferData_Max))
        {
            LoadDefaults();
        }

        // Payload checks
        {
            flatbuffers::Verifier verifier(m_Data.rgFlatbufferData, cbFlatbufferData);
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
        Updated,
        Invalid,
    };

    ConfigUpdateResult UpdateFromString(char const* const szData)
    {
        return ConfigUpdateResult::Retained;
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
        uint16_t cbData;

        ConfigurationHeader()
            : Signature()
            , Version()
            , cbData()
        {
        }

        static constexpr uint16_t sc_Signature = 0x8233;
        static constexpr uint16_t sc_CurrentVersion = 3;
    };

    struct ConfigurationData
    {
        ConfigurationHeader Header;

        static constexpr uint16_t sc_cbFlatbufferData_Max = 256;
        uint8_t rgFlatbufferData[sc_cbFlatbufferData_Max];
    };

    static constexpr int sc_EEPROMAddress = 0;

    // Readable state
    ConfigurationData m_Data;
    Flatbuffers::Firmware::ThermostatConfiguration const* m_pConfiguration;

    // Pending (to be ingested and written out) state
    uint16_t m_cbPendingData;
    uint8_t m_PendingData[ConfigurationData::sc_cbFlatbufferData_Max];

    // Protects pending state (readable state is always good to read)
    Mutex m_Mutex;

private:
    void LoadDefaults()
    {
        // Build flatbuffer with default values
        flatbuffers::FlatBufferBuilder flatbufferBuilder(ConfigurationData::sc_cbFlatbufferData_Max);
        {
            auto const rootConfiguration = Flatbuffers::Firmware::CreateThermostatConfiguration(flatbufferBuilder);
            Flatbuffers::Firmware::FinishThermostatConfigurationBuffer(flatbufferBuilder, rootConfiguration);
        }

        // Verify size and casting limits
        if (flatbufferBuilder.GetSize() > ConfigurationData::sc_cbFlatbufferData_Max)
        {
            Serial.printlnf("Default configuration size of %u exceeds limits. Bailing.", flatbufferBuilder.GetSize());
            // TODO: bail
        }

        // Commit data to RAM
        m_Data.Header.Signature = ConfigurationHeader::sc_Signature;
        m_Data.Header.Version = ConfigurationHeader::sc_CurrentVersion;

        memcpy(m_Data.rgFlatbufferData, flatbufferBuilder.GetBufferPointer(), flatbufferBuilder.GetSize());
        m_Data.Header.cbData = sizeof(ConfigurationHeader) + static_cast<uint16_t>(flatbufferBuilder.GetSize());

        // Don't bother committing default data to EEPROM
        // - we'll just overwrite it when we get an updated configuration or reload defaults on the next power cycle.
    }
};