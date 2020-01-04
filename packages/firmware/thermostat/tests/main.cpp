#define CATCH_CONFIG_MAIN  // This tells Catch to provide a main() - only do this here
#include "base.h"

// Include implementation source files
#include "../Thermostat.cpp"
#include "../ThermostatSetpointScheduler.cpp"

// Instantiate mock globals
MockEEPROM EEPROM;
MockParticle Particle;
MockSerial Serial;
MockSystem System;
MockTime Time;
MockWiFi WiFi;
MockWire Wire;

// Statics

// Default values for the (legacy) core configuration (vs. settings)
ThermostatAction const SyntheticConfiguration::sc_DefaultAllowedActions = ThermostatAction::Cool;
float const SyntheticConfiguration::sc_DefaultSetPointHeat = 20;
float const SyntheticConfiguration::sc_DefaultSetPointCool = 24;


// Bogus test case
TEST_CASE("Tests execute", "[basics]")
{
    REQUIRE(1 == 1);
}
