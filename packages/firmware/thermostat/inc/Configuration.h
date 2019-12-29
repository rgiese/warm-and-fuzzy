#pragma once

#include <Particle.h>

#include <mutex>

#define ARDUINOJSON_ENABLE_PROGMEM 0
#include <ArduinoJson.h>

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
        , m_fIsReadOnly()
        , m_Mutex()
    {
    }

    ~Configuration()
    {
    }

public:
    //
    // Snap (read-only clone) support
    // - clones shouldn't be able to take updates or persist to EEPROM
    //

    Configuration(Configuration const& rhs)
        : Configuration()
    {
        // Provide a transaction-level lock while copying;
        // we're using a recursive mutex so the accessors can do their own locks as well.
        LockGuard autoLock(rhs.m_Mutex);

        m_Data = rhs.m_Data;
        m_fIsReadOnly = true;
    }

    Configuration& operator=(Configuration const&) = delete;

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
        LockGuard autoLock(m_Mutex);

        return m_fIsDirty;
    }

    void Flush()
    {
        LockGuard autoLock(m_Mutex);

        if (!m_fIsDirty)
        {
            return;
        }

        // EEPROM.put will figure out which bytes have changed and save only those
        // (c.f. https://docs.particle.io/reference/device-os/firmware/photon/#put-)
        EEPROM.put(sc_EEPROMAddress, m_Data);

        m_fIsDirty = false;
    }

    enum class ConfigUpdateResult
    {
        Retained,
        Updated,
        Invalid,
        NotAllowed,
    };

    ConfigUpdateResult UpdateFromString(char const* const szData)
    {
        if (m_fIsReadOnly)
        {
            // The property accessors wouldn't take updates anyhow
            // but this provides a more succinct error.
            return ConfigUpdateResult::NotAllowed;
        }

        // Set up document
        size_t constexpr cbJsonDocument =
            JSON_OBJECT_SIZE(6)  // {"sh":20.0, "sc": 22.0, "th": 1.0, "ca": 60, "aa": "HCR", "xs": "2851861f0b000033"}
            + countof("sh")      // string copy of "sh" (setPointHeat)
            + countof("sc")      // string copy of "sc" (setPointCool)
            + countof("th")      // string copy of "th" (threshold)
            + countof("ca")      // string copy of "ca" (cadence)
            + countof("aa")      // string copy of "aa" (allowedActions)
            + countof("HCR")     // string copy of potential values for aa (allowedActions)
            + countof("xs")      // string copy of "xs" (externalSensorId)
            + countof("2851861f0b000033")  // string copy of external sensor ID (16 hex characters)
            ;

        StaticJsonDocument<cbJsonDocument> jsonDocument;
        {
            DeserializationError const jsonError = deserializeJson(jsonDocument, szData);

            if (jsonError)
            {
                return onInvalidConfig("Failed to deserialize", szData);
            }
        }

        // Extract values from document
        // (goofy macro because ArduinoJson's variant.is<> can't be used inside a template with gcc)

#define GET_JSON_VALUE(MemberName, Target)                                     \
    JsonVariant variant = jsonDocument.getMember(MemberName);                  \
                                                                               \
    if (variant.isNull() || !variant.is<decltype(Target)>())                   \
    {                                                                          \
        return onInvalidConfig("'" MemberName "' missing or invalid", szData); \
    }                                                                          \
                                                                               \
    Target = variant.as<decltype(Target)>();

#define GET_OPTIONAL_JSON_STRING(MemberName, Target)                                                      \
    Target = nullptr;                                                                                     \
    JsonVariant variant = jsonDocument.getMember(MemberName);                                             \
                                                                                                          \
    if (!variant.isNull() && variant.is<decltype(Target)>() && variant.as<decltype(Target)>()[0] != '\0') \
    {                                                                                                     \
        Target = variant.as<decltype(Target)>();                                                          \
    }


        float setPointHeat;
        {
            GET_JSON_VALUE("sh", setPointHeat);
        }

        float setPointCool;
        {
            GET_JSON_VALUE("sc", setPointCool);
        }

        float threshold;
        {
            GET_JSON_VALUE("th", threshold);
        }

        uint16_t cadence;
        {
            GET_JSON_VALUE("ca", cadence);
        }

        Thermostat::Actions allowedActions;
        {
            char const* szAllowedActions;
            {
                GET_JSON_VALUE("aa", szAllowedActions);
            }

            if (!allowedActions.UpdateFromString(szAllowedActions))
            {
                return onInvalidConfig("'aa' contains invalid token", szData);
            }
        }

        OneWireAddress externalSensorId;
        {
            char const* szExternalSensorId = NULL;
            {
                GET_OPTIONAL_JSON_STRING("xs", szExternalSensorId);
            }

            if (szExternalSensorId)
            {
                if (!externalSensorId.FromString(szExternalSensorId))
                {
                    return onInvalidConfig("'xs' is malformed OneWire address", szData);
                }
            }
        }

#undef GET_JSON_VALUE

        // Commit values
        {
            // Provide a transaction-level lock for all updates;
            // we're using a recursive mutex so the accessors can do their own locks as well.
            LockGuard autoLock(m_Mutex);

            SetPointHeat(setPointHeat);
            SetPointCool(setPointCool);
            Threshold(threshold);
            Cadence(cadence);
            AllowedActions(allowedActions);
            ExternalSensorId(externalSensorId);

            bool const fIsDirty = IsDirty();

            Flush();

            return fIsDirty ? ConfigUpdateResult::Updated : ConfigUpdateResult::Retained;
        }
    }

    //
    // Debugging
    //
    void PrintConfiguration() const
    {
        LockGuard autoLock(m_Mutex);

        char szExternalSensorId[OneWireAddress::sc_cchAsHexString_WithTerminator];
        ExternalSensorId().ToString(szExternalSensorId);

        Serial.printlnf(
            "SetPoints = %.1f C (heat) / %.1f C (cool), Threshold = +/-%.1f C, Cadence = %u sec, AllowedActions = "
            "[%c%c%c], ExternalSensorId = %s",
            SetPointHeat(),
            SetPointCool(),
            Threshold(),
            Cadence(),
            AllowedActions().Heat ? 'H' : '_',
            AllowedActions().Cool ? 'C' : '_',
            AllowedActions().Circulate ? 'R' : '_',
            szExternalSensorId);
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
        static constexpr uint16_t sc_CurrentVersion = 2;
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

        /**
         * @name ExternalSensorId
         * External sensor ID (if provided, prefer this over onboard sensor) [OneWire 64-bit hex ID]
         */
        OneWireAddress ExternalSensorId;

        ConfigurationData()
            : Header()
            , SetPointHeat()
            , SetPointCool()
            , Threshold()
            , Cadence()
            , AllowedActions()
            , ExternalSensorId()
        {
        }
    };

#define WAF_GENERATE_CONFIGURATION_ACCESSOR(FieldName)                      \
    decltype(Configuration::ConfigurationData::FieldName) FieldName() const \
    {                                                                       \
        LockGuard autoLock(m_Mutex);                                        \
        return m_Data.FieldName;                                            \
    }                                                                       \
                                                                            \
    decltype(Configuration::ConfigurationData::FieldName) FieldName(        \
        decltype(Configuration::ConfigurationData::FieldName) const& value) \
    {                                                                       \
        if (!m_fIsReadOnly)                                                 \
        {                                                                   \
            LockGuard autoLock(m_Mutex);                                    \
            auto const acceptedValue = clamp##FieldName(value);             \
            if (acceptedValue != m_Data.FieldName)                          \
            {                                                               \
                m_Data.FieldName = acceptedValue;                           \
                m_fIsDirty = true;                                          \
            }                                                               \
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
    WAF_GENERATE_CONFIGURATION_ACCESSOR(ExternalSensorId);

private:
#undef WAF_GENERATE_CONFIGURATION_ACCESSOR

private:
    typedef std::recursive_mutex Mutex;
    typedef std::lock_guard<Mutex> LockGuard;

private:
    ConfigurationData m_Data;
    bool m_fIsDirty;
    bool m_fIsReadOnly;
    mutable Mutex m_Mutex;

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
        ExternalSensorId(OneWireAddress());

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

    OneWireAddress const& clampExternalSensorId(OneWireAddress const& value) const
    {
        return value;
    }

private:
    ConfigUpdateResult onInvalidConfig(char const* szReason, char const* szData)
    {
        Serial.printlnf("Invalid config (%s): %s", szReason, szData);
        return ConfigUpdateResult::Invalid;
    }
};