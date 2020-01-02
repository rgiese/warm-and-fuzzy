#pragma once

// From Particle's device-os/hal/src/photon/pinmap_defines.h

// Digital pins
#define D0 0
#define D1 1
#define D2 2
#define D3 3
#define D4 4
#define D5 5
#define D6 6
#define D7 7

// Analog pins
#define A0 10
#define A1 11
#define A2 12
#define A3 13
#define A4 14
#define A5 15
#define A6 16

// WKP pin is also an ADC on Photon
#define A7 17
#define WKP 17

#define RX 18
#define TX 19

#define BTN 20

// Timer pins
#define TIMER2_CH1 10
#define TIMER2_CH2 11
#define TIMER2_CH3 18
#define TIMER2_CH4 19

#define TIMER3_CH1 14
#define TIMER3_CH2 15
#define TIMER3_CH3 16
#define TIMER3_CH4 17

#define TIMER4_CH1 1
#define TIMER4_CH2 0

// SPI pins
#define SS 12
#define SCK 13
#define MISO 14
#define MOSI 15

// I2C pins
#define SDA 0
#define SCL 1

// DAC pins on Photon
#define DAC1 16
#define DAC2 13

// RGB LED pins
#define RGBR 21
#define RGBG 22
#define RGBB 23
