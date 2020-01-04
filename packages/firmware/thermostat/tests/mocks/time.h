#pragma once

inline uint32_t millis()
{
    return 0;
}

inline void delay(uint32_t _duration)
{
    // Do nothing
}

// See Particle's device-os/wiring/inc/spark_wiring_time.h
class MockTime
{
public:
    MockTime()
    {
    }

public:
    uint32_t now() const
    {
        return 0;
    }

    int weekday(uint32_t const t) const
    {
        return 1;
    }

    int hour(uint32_t const t) const
    {
        return 0;
    }

    int minute(uint32_t const t) const
    {
        return 0;
    }
};

extern MockTime Time;