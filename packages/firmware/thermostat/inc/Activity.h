#pragma once

class Activity
{
public:
    Activity(char const* const szName)
        : m_szName(szName)
        , m_StartTime_msec(millis())
    {
        WITH_LOCK(Serial)
        {
            Serial.printlnf(">> %s (SSID: %s)", m_szName, getSSID());
        }
    }

    ~Activity()
    {
        unsigned long const endTime_msec = millis();
        unsigned long const duration_msec = endTime_msec - m_StartTime_msec;

        WITH_LOCK(Serial)
        {
            Serial.printlnf("<< %s (%lu msec) (SSID: %s)", m_szName, duration_msec, getSSID());
        }
    }

private:
    char const* const m_szName;
    unsigned long const m_StartTime_msec;

    char const* getSSID() const
    {
        return Particle.connected() ? WiFi.SSID() : "<not connected>";
    }
};