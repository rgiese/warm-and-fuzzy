#pragma once

#include <Particle.h>

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
// To minimize the required effort and dynamic allocations, the Configuration class below will not auto-save changes,
// requiring a call to Configuration::Flush() whenever necessary and appropriate.
//
// Our implementation will still rely on the Device OS's de-duplicating feature so anytime we Flush(),
// we'll just EEPROM.put(T) the entire Configuration structure.
//

class Configuration
{
public:
    Configuration()
        : m_Data()
        , m_fIsDirty()
    {
    }

    ~Configuration()
    {
    }

public:
    //
    // Operations
    // (see further below for accessors)
    //

    void Initialize()
    {
        // Load from EEPROM
        EEPROM.get(sc_EEPROMAddress, m_Data);

        // Header checks
        if (m_Data.Header.Signature != ConfigurationHeader::sc_Signature)
        {
            LoadDefaults();
        }
        else if (m_Data.Header.Version != ConfigurationHeader::sc_CurrentVersion)
        {
            // FUTURE: Migrate data
            LoadDefaults();
        }

        if (m_Data.Header.cbData != sizeof(m_Data))
        {
            // Should have matched by now
            LoadDefaults();
        }
    }

    bool IsDirty() const
    {
        return m_fIsDirty;
    }

    void Flush()
    {
        if (!m_fIsDirty)
        {
            return;
        }

        // EEPROM.put will figure out which bytes have changed and save only those
        // (c.f. https://docs.particle.io/reference/device-os/firmware/photon/#put-)
        EEPROM.put(sc_EEPROMAddress, m_Data);

        m_fIsDirty = false;
    }

    //
    // Debugging
    //
    void PrintConfiguration() const
    {
        Serial.printlnf(
            "SetPoints = %.1f C (heat) / %.1f C (cool), Threshold = +/-%.1f C, Cadence = %u sec, AllowedActions = "
            "[%c%c%c]",
            SetPointHeat(),
            SetPointCool(),
            Threshold(),
            Cadence(),
            AllowedActions().Heat ? 'H' : '_',
            AllowedActions().Cool ? 'C' : '_',
            AllowedActions().Circulate ? 'R' : '_');
    }

private:
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
        static constexpr uint16_t sc_CurrentVersion = 1;
    };

    struct ConfigurationData
    {
        ConfigurationHeader Header;

        /**
         * @name SetPointHeat
         *
         * Target temperature for heating
         * Units: Celsius
         */
        float SetPointHeat;

        /**
         * @name SetPointCool
         *
         * Target temperature for cooling
         * Units: Celsius
         */
        float SetPointCool;

        /**
         * @name Threshold
         *
         * Hysteresis threshold around target
         * Units: Celsius
         */
        float Threshold;

        /**
         * @name Cadence
         * Operational cadence
         * Units: seconds
         */
        uint16_t Cadence;

        /**
         * @name AllowedActions
         * Allowed actions (e.g. heat, cool, circulate)
         */
        Thermostat::Actions AllowedActions;

        ConfigurationData()
            : Header()
            , SetPointHeat()
            , SetPointCool()
            , Threshold()
            , Cadence()
            , AllowedActions()
        {
        }
    };

#define WAF_GENERATE_CONFIGURATION_ACCESSOR(FieldName)                      \
    decltype(Configuration::ConfigurationData::FieldName) FieldName() const \
    {                                                                       \
        return m_Data.FieldName;                                            \
    }                                                                       \
                                                                            \
    decltype(Configuration::ConfigurationData::FieldName) FieldName(        \
        decltype(Configuration::ConfigurationData::FieldName) value)        \
    {                                                                       \
        auto const acceptedValue = clamp##FieldName(value);                 \
        if (acceptedValue != m_Data.FieldName)                              \
        {                                                                   \
            m_Data.FieldName = acceptedValue;                               \
            m_fIsDirty = true;                                              \
        }                                                                   \
        return m_Data.FieldName;                                            \
    }

public:
    //
    // Accessors
    //

    WAF_GENERATE_CONFIGURATION_ACCESSOR(SetPointHeat);
    WAF_GENERATE_CONFIGURATION_ACCESSOR(SetPointCool);
    WAF_GENERATE_CONFIGURATION_ACCESSOR(Threshold);
    WAF_GENERATE_CONFIGURATION_ACCESSOR(Cadence);
    WAF_GENERATE_CONFIGURATION_ACCESSOR(AllowedActions);

private:
#undef WAF_GENERATE_CONFIGURATION_ACCESSOR

private:
    ConfigurationData m_Data;
    bool m_fIsDirty;

    static constexpr int sc_EEPROMAddress = 0;

private:
    void LoadDefaults()
    {
        m_Data.Header.Signature = ConfigurationHeader::sc_Signature;
        m_Data.Header.Version = ConfigurationHeader::sc_CurrentVersion;
        m_Data.Header.cbData = sizeof(m_Data);

        SetPointHeat(18.0f);
        SetPointCool(20.0f);
        Threshold(1.0f);
        Cadence(60);
        AllowedActions(Thermostat::Actions());

        m_fIsDirty = true;
    }

    float clampSetPointHeat(float const value) const
    {
        return clamp(value, 16.0f, 40.0f);
    }

    float clampSetPointCool(float const value) const
    {
        return clamp(value, 16.0f, 40.0f);
    }

    float clampThreshold(float const value) const
    {
        return clamp(value, 0.25f, 2.0f);
    }

    uint16_t clampCadence(uint16_t const value) const
    {
        return clamp(value, static_cast<uint16_t>(10), static_cast<uint16_t>(3600));
    }

    Thermostat::Actions clampAllowedActions(Thermostat::Actions const& value) const
    {
        return value.Clamp();
    }
};