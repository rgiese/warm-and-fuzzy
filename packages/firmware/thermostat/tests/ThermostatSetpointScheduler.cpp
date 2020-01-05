#include "base.h"

SCENARIO("Thermostat setpoints scheduler works", "[ThermostatSetpointScheduler]")
{
    ThermostatSetpointScheduler scheduler;

    GIVEN("A blank configuration")
    {
        SyntheticConfiguration configuration;
        configuration.Build();

        WHEN("Current time is zero")
        {
            Time.testSetUTCTime(0);

            THEN("A blank setting is returned")
            {
                ThermostatSetpoint const setpoint = scheduler.getCurrentThermostatSetpoint(configuration);

                REQUIRE(setpoint.SetPointHeat == SyntheticConfiguration::sc_DefaultSetPointHeat);
                REQUIRE(setpoint.SetPointCool == SyntheticConfiguration::sc_DefaultSetPointCool);
                REQUIRE(setpoint.AllowedActions == SyntheticConfiguration::sc_DefaultAllowedActions);
            }
        }
    }

    GIVEN("A configuration with a hold and a scheduled setting")
    {
        SyntheticConfiguration configuration;

        ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
        configuration.AddHoldSetting(1000, setpointHold);

        ThermostatSetpoint setpointScheduled(ThermostatAction::Cool, 30, 40);
        configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Tuesday, 120, setpointScheduled);

        configuration.Build();

        WHEN("It is before the hold expiration time")
        {
            Time.testSetUTCTime(0);

            THEN("The Hold setting is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointHold);
            }
        }

        WHEN("It is after the hold expiration time and after the scheduled time")
        {
            Time.testSetLocalTime(ParticleDayOfWeek::Wednesday, 10, 0);

            THEN("The Scheduled setting is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointScheduled);
            }
        }

        WHEN("It is after the hold expiration time and before the scheduled time")
        {
            Time.testSetLocalTime(ParticleDayOfWeek::Monday, 0, 0);

            THEN("The Scheduled setting is still returned since it's the only scheduled setting")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointScheduled);
            }
        }
    }
}