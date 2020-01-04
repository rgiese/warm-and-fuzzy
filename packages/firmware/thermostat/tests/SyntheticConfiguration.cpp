#include "base.h"

SCENARIO("Synthetic configuration", "[SyntheticConfiguration]")
{
    GIVEN("A blank configuration")
    {
        SyntheticConfiguration configuration;

        WHEN("The configuration is built")
        {
            configuration.Build();

            THEN("The default values are propagated")
            {
                REQUIRE(configuration.rootConfiguration().allowedActions() ==
                        SyntheticConfiguration::sc_DefaultAllowedActions);
                REQUIRE(Configuration::getTemperature(configuration.rootConfiguration().setPointHeat_x100()) ==
                        SyntheticConfiguration::sc_DefaultSetPointHeat);
                REQUIRE(Configuration::getTemperature(configuration.rootConfiguration().setPointCool_x100()) ==
                        SyntheticConfiguration::sc_DefaultSetPointCool);
            }
        }

        WHEN("The configuration is built with settings")
        {
            ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20);
            configuration.AddHoldSetting(1000, setpointHold);

            ThermostatSetpoint setpointScheduled(ThermostatAction::Cool, 30, 40);
            configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Tuesday, 120, setpointScheduled);

            configuration.Build();

            THEN("The provided values are propagated")
            {
                auto const pvThermostatSettings = configuration.rootConfiguration().thermostatSettings();

                REQUIRE(pvThermostatSettings);
                REQUIRE(pvThermostatSettings->size() == 2);

                auto const& holdSetting = pvThermostatSettings->Get(0);
                {
                    REQUIRE(holdSetting->type() == ThermostatSettingType::Hold);
                    REQUIRE(holdSetting->holdUntil() == 1000);
                    REQUIRE(holdSetting->allowedActions() == setpointHold.AllowedActions);
                    REQUIRE(Configuration::getTemperature(holdSetting->setPointHeat_x100()) ==
                            setpointHold.SetPointHeat);
                    REQUIRE(Configuration::getTemperature(holdSetting->setPointCool_x100()) ==
                            setpointHold.SetPointCool);
                }

                auto const& scheduledSetting = pvThermostatSettings->Get(1);
                {
                    REQUIRE(scheduledSetting->type() == ThermostatSettingType::Scheduled);
                    REQUIRE(scheduledSetting->daysOfWeek() == (DaysOfWeek::Monday | DaysOfWeek::Tuesday));
                    REQUIRE(scheduledSetting->atMinutesSinceMidnight() == 120);
                    REQUIRE(scheduledSetting->allowedActions() == setpointScheduled.AllowedActions);
                    REQUIRE(Configuration::getTemperature(scheduledSetting->setPointHeat_x100()) ==
                            setpointScheduled.SetPointHeat);
                    REQUIRE(Configuration::getTemperature(scheduledSetting->setPointCool_x100()) ==
                            setpointScheduled.SetPointCool);
                }
            }
        }
    }
}