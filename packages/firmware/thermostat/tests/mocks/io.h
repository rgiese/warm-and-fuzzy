#pragma once

// c.f. Particle's device-os/hal/inc/pinmap_hal.h
typedef enum PinMode
{
    // INPUT conflicts with Windows header included by Catch2, but we don't need this definition right now so omit it.
    // INPUT,
    OUTPUT,
    INPUT_PULLUP,
    INPUT_PULLDOWN,
    AF_OUTPUT_PUSHPULL,  // Used internally for Alternate Function Output PushPull(TIM, UART, SPI etc)
    AF_OUTPUT_DRAIN,     // Used internally for Alternate Function Output Drain(I2C etc). External pullup resistors
                         // required.
    AN_INPUT,            // Used internally for ADC Input
    AN_OUTPUT,           // Used internally for DAC Output,
    OUTPUT_OPEN_DRAIN = AF_OUTPUT_DRAIN,
    PIN_MODE_NONE = 0xFF
} PinMode;

// c.f. Particle's device-os/wiring_globals/src/spark_wiring_gpio.cpp
inline void pinMode(pin_t _pin, PinMode _setMode)
{
}

inline void digitalWrite(pin_t _pin, uint8_t _value)
{
}
