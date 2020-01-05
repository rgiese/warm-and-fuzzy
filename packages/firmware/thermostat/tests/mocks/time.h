#pragma once

inline uint32_t millis()
{
    return 0;
}

inline void delay(uint32_t _duration)
{
    // Do nothing
}

// Test helper types
enum class ParticleDayOfWeek : uint8_t
{
    Sunday = 1,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday
};

// See Particle's device-os/wiring/inc/spark_wiring_time.h
class MockTime
{
public:
    MockTime()
        : m_Now()
    {
    }

public:
    //
    // Product code API
    //

    uint32_t now() const
    {
        return m_Now;
    }

    int weekday(uint32_t const t) const
    {
        return getCalendarTime()->tm_wday + 1;  // Particle: Sunday = 1, CRT: Sunday = 0
    }

    int hour(uint32_t const t) const
    {
        return getCalendarTime()->tm_hour;
    }

    int minute(uint32_t const t) const
    {
        return getCalendarTime()->tm_min;
    }

public:
    //
    // Test code API
    //
    void testSetUTCTime(uint32_t const now)
    {
        m_Now = now;
    }

    void testSetLocalTime(ParticleDayOfWeek dayOfWeek, int hour, int minute)
    {
        // Use Sunday Jan 5 2020 as our arbitrary anchor
        // Also recall ParticleDayOfWeek::Sunday == 1

        std::tm time = {
            tm_min : minute,
            tm_hour : hour,
            tm_mday : 4 + static_cast<int>(dayOfWeek),
            tm_mon : 1 - 1,
            tm_year : 2020 - 1900
        };

        // std::mktime takes local time and returns UTC
        time_t const now = std::mktime(&time);

        m_Now = now;
    }

private:
    uint32_t m_Now;

    std::tm const* getCalendarTime() const
    {
        std::time_t const now = m_Now;
        return std::localtime(&now);
    }
};

extern MockTime Time;