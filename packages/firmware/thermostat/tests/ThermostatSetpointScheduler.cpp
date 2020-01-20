#include "base.h"

SCENARIO("Thermostat setpoint scheduler basics", "[ThermostatSetpointScheduler]")
{
    ThermostatSetpointScheduler scheduler;

    GIVEN("A blank configuration")
    {
        SyntheticConfiguration configuration;
        configuration.Build();

        WHEN("Current time is zero")
        {
            Time.testSetUTCTime(0);

            THEN("A default setpoint is returned")
            {
                ThermostatSetpoint const setpoint = scheduler.getCurrentThermostatSetpoint(configuration);
                ThermostatSetpoint const emptySetpoint;

                REQUIRE(setpoint == emptySetpoint);
            }
        }
    }

    GIVEN("A configuration with a hold and a scheduled setting")
    {
        SyntheticConfiguration configuration;

        ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
        configuration.AddHoldSetting(1000, setpointHold);

        ThermostatSetpoint setPointScheduled(ThermostatAction::Cool, 30, 40);
        configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Tuesday, 120, setPointScheduled);

        configuration.Build();

        WHEN("It is before the hold expiration time")
        {
            Time.testSetUTCTime(0);

            THEN("The Hold setpoint is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointHold);
            }
        }

        WHEN("It is after the hold expiration time and after the scheduled time")
        {
            Time.testSetLocalTime(ParticleDayOfWeek::Wednesday, 10, 0);

            THEN("The Scheduled setpoint is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPointScheduled);
            }
        }

        WHEN("It is after the hold expiration time and before the scheduled time")
        {
            Time.testSetLocalTime(ParticleDayOfWeek::Monday, 0, 0);

            THEN("The Scheduled setpoint is still returned since it's the only scheduled setting")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPointScheduled);
            }
        }
    }

    GIVEN("A configuration with several hold settings")
    {
        SyntheticConfiguration configuration;

        ThermostatSetpoint setpointHold1(ThermostatAction::Circulate, 10, 20);
        configuration.AddHoldSetting(1000, setpointHold1);

        ThermostatSetpoint setpointHold2(ThermostatAction::Circulate, 30, 40);
        configuration.AddHoldSetting(2000, setpointHold2);

        ThermostatSetpoint setpointHold3(ThermostatAction::Circulate, 50, 60);
        configuration.AddHoldSetting(3000, setpointHold3);

        configuration.Build();

        WHEN("It is before the first hold expiration time")
        {
            Time.testSetUTCTime(0);

            THEN("The first Hold setpoint is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointHold1);
            }
        }

        WHEN("It is right at the first hold expiration time")
        {
            Time.testSetUTCTime(1000);

            THEN("The first Hold setpoint is still returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointHold1);
            }
        }

        WHEN("It is after the first but before the second hold expiration time")
        {
            Time.testSetUTCTime(1500);

            THEN("The second Hold setpoint is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointHold2);
            }
        }

        WHEN("It is after the second but before the third hold expiration time")
        {
            Time.testSetUTCTime(2500);

            THEN("The third Hold setpoint is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setpointHold3);
            }
        }

        WHEN("It is after the third hold expiration time")
        {
            Time.testSetUTCTime(3500);

            ThermostatSetpoint emptySetpoint;
            THEN("An empty setpoint is returned")
            {
                REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == emptySetpoint);
            }
        }
    }

    {
        // Test a bunch of different ways to build the same schedule
        ThermostatSetpoint const setPoints[] = {ThermostatSetpoint(ThermostatAction::Cool, 10, 10.5),
                                                ThermostatSetpoint(ThermostatAction::Cool, 12, 12.5),
                                                ThermostatSetpoint(ThermostatAction::Cool, 14, 14.5),
                                                ThermostatSetpoint(ThermostatAction::Cool, 16, 16.5)};

        auto fnVerifySettings = [&scheduler](SyntheticConfiguration const& configuration,
                                             ThermostatSetpoint const setPoints[4]) {
            // Monday 9am = setPoints[0]
            // Monday 3pm = setPoints[1]
            // Wednesday 9am = setPoints[2]
            // Wednesday 3pm = setPoints[3]

            WHEN("It is time for the first setting")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Monday, 9, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[0]);
                }
            }

            WHEN("It is still time for the first setting")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Monday, 9, 15);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[0]);
                }
            }

            WHEN("It is time for the second setting")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Monday, 18, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[1]);
                }
            }

            WHEN("It is still time for the second setting on the next day")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Tuesday, 9, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[1]);
                }
            }

            WHEN("It is time for the third setting")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Wednesday, 10, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[2]);
                }
            }

            WHEN("It is time for the fourth setting")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Wednesday, 19, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[3]);
                }
            }

            WHEN("It is still time for the fourth setting later in the week")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Saturday, 10, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[3]);
                }
            }

            WHEN("It is still time for the fourth setting at the end of the week")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Sunday, 10, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[3]);
                }
            }

            WHEN("It is still time for the fourth setting at the beginning of the week")
            {
                Time.testSetLocalTime(ParticleDayOfWeek::Monday, 8, 00);

                THEN("The right Scheduled setpoint is returned")
                {
                    REQUIRE(scheduler.getCurrentThermostatSetpoint(configuration) == setPoints[3]);
                }
            }
        };

        GIVEN("Monday, Wednesday, two scheduled settings a day, each setting in a single setting entry")
        {
            SyntheticConfiguration configuration;

            ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
            configuration.AddHoldSetting(10, setpointHold);  // expired hold for good measure

            configuration.AddScheduledSetting(DaysOfWeek::Monday, 9 * 60, setPoints[0]);
            configuration.AddScheduledSetting(DaysOfWeek::Monday, 15 * 60, setPoints[1]);
            configuration.AddScheduledSetting(DaysOfWeek::Wednesday, 9 * 60, setPoints[2]);
            configuration.AddScheduledSetting(DaysOfWeek::Wednesday, 15 * 60, setPoints[3]);

            configuration.Build();

            fnVerifySettings(configuration, setPoints);
        }

        GIVEN("Monday, Wednesday, two scheduled settings a day, each setting in a single setting entry, out of order")
        {
            SyntheticConfiguration configuration;

            ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
            configuration.AddHoldSetting(10, setpointHold);  // expired hold for good measure

            configuration.AddScheduledSetting(DaysOfWeek::Wednesday, 9 * 60, setPoints[2]);
            configuration.AddScheduledSetting(DaysOfWeek::Monday, 15 * 60, setPoints[1]);
            configuration.AddScheduledSetting(DaysOfWeek::Monday, 9 * 60, setPoints[0]);
            configuration.AddScheduledSetting(DaysOfWeek::Wednesday, 15 * 60, setPoints[3]);

            configuration.Build();

            fnVerifySettings(configuration, setPoints);
        }

        GIVEN("Monday, Wednesday, two scheduled settings a day, folded setting entries")
        {
            SyntheticConfiguration configuration;

            ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
            configuration.AddHoldSetting(10, setpointHold);  // expired hold for good measure

            ThermostatSetpoint const groupedSetPoints[] = {
                setPoints[0], setPoints[1], setPoints[0], setPoints[1]  // Repeat Mon/Wed programs
            };

            configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Wednesday, 9 * 60, setPoints[0]);
            configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Wednesday, 15 * 60, setPoints[1]);

            configuration.Build();

            fnVerifySettings(configuration, groupedSetPoints);
        }

        GIVEN("Monday, Wednesday, two scheduled settings a day, partially folded setting entries")
        {
            SyntheticConfiguration configuration;

            ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
            configuration.AddHoldSetting(10, setpointHold);  // expired hold for good measure

            ThermostatSetpoint const groupedSetPoints[] = {
                setPoints[0], setPoints[1], setPoints[0], setPoints[3]  // Repeat Mon/Wed morning programs
            };

            configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Wednesday, 9 * 60, setPoints[0]);
            configuration.AddScheduledSetting(DaysOfWeek::Monday, 15 * 60, setPoints[1]);
            configuration.AddScheduledSetting(DaysOfWeek::Wednesday, 15 * 60, setPoints[3]);

            configuration.Build();

            fnVerifySettings(configuration, groupedSetPoints);
        }
    }
}