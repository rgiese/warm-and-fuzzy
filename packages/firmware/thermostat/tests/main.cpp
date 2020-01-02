#define CATCH_CONFIG_MAIN  // This tells Catch to provide a main() - only do this here
#include "base.h"

// Include implementation source files
#include "Thermostat.cpp"
#include "ThermostatSetpointScheduler.cpp"

// Instantiate mock globals
MockEEPROM EEPROM;
MockParticle Particle;
MockSerial Serial;
MockSystem System;
MockTime Time;
MockWiFi WiFi;
MockWire Wire;

// Bogus test case
TEST_CASE("Tests execute", "[basics]")
{
    REQUIRE(1 == 1);
}
