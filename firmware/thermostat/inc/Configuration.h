#pragma once

#include <Particle.h>

//
// A note on EEPROM emulation on Particle devices:
// (c.f. https://github.com/particle-iot/device-os > services/inc/eeprom_emulation.h)
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
            // FUTURE: Migrate cbData
            LoadDefaults();
        }

        if (m_Data.Header.cbData != sizeof(m_Data))
        {
            // Should have matched by now
            LoadDefaults();
        }
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
    // Accessors
    //

    float SetPoint() const
    {
        return m_Data.SetPoint;
    }

    float SetPoint(float value)
    {
        if (value != m_Data.SetPoint)
        {
            m_Data.SetPoint = value;
            m_fIsDirty = true;
        }

        return SetPoint();
    }

private:
    void LoadDefaults()
    {
        m_Data.Header.Signature = ConfigurationHeader::sc_Signature;
        m_Data.Header.Version = ConfigurationHeader::sc_CurrentVersion;
        m_Data.Header.cbData = sizeof(m_Data);

        m_Data.SetPoint = 18.0f;

        m_fIsDirty = true;
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

        float SetPoint;

        ConfigurationData()
            : Header()
            , SetPoint()
        {
        }
    };

    ConfigurationData m_Data;
    bool m_fIsDirty;

    static constexpr int sc_EEPROMAddress = 0;
};