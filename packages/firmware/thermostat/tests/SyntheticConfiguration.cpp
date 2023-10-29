#include "base.h"

SCENARIO("Synthetic configuration", "[SyntheticConfiguration]")
{
    GIVEN("A blank configuration")
    {
        SyntheticConfiguration configuration;

        WHEN("The configuration is built with settings")
        {
            ThermostatSetpoint setpointHold(ThermostatAction::Circulate, 10, 20, 12, 22);
            configuration.AddHoldSetting(1000, setpointHold);

            ThermostatSetpoint setpointScheduled(ThermostatAction::Cool, 30, 40, 14, 24);
            configuration.AddScheduledSetting(DaysOfWeek::Monday | DaysOfWeek::Tuesday, 120, setpointScheduled);

            configuration.Build();

            THEN("The provided values are propagated")
            {
                auto const pvThermostatSettings = configuration.rootConfiguration().thermostat_settings();

                REQUIRE(pvThermostatSettings);
                REQUIRE(pvThermostatSettings->size() == 2);

                auto const& holdSetting = pvThermostatSettings->Get(0);
                {
                    REQUIRE(holdSetting->type() == ThermostatSettingType::Hold);
                    REQUIRE(holdSetting->hold_until() == 1000);
                    REQUIRE(holdSetting->allowed_actions() == setpointHold.AllowedActions);
                    REQUIRE(Configuration::getTemperature(holdSetting->set_point_heat_x100()) ==
                            setpointHold.SetPointHeat);
                    REQUIRE(Configuration::getTemperature(holdSetting->set_point_cool_x100()) ==
                            setpointHold.SetPointCool);
                    REQUIRE(Configuration::getTemperature(holdSetting->set_point_circulate_above_x100()) ==
                            setpointHold.SetPointCirculateAbove);
                    REQUIRE(Configuration::getTemperature(holdSetting->set_point_circulate_below_x100()) ==
                            setpointHold.SetPointCirculateBelow);
                }

                auto const& scheduledSetting = pvThermostatSettings->Get(1);
                {
                    REQUIRE(scheduledSetting->type() == ThermostatSettingType::Scheduled);
                    REQUIRE(scheduledSetting->days_of_week() == (DaysOfWeek::Monday | DaysOfWeek::Tuesday));
                    REQUIRE(scheduledSetting->at_minutes_since_midnight() == 120);
                    REQUIRE(scheduledSetting->allowed_actions() == setpointScheduled.AllowedActions);
                    REQUIRE(Configuration::getTemperature(scheduledSetting->set_point_heat_x100()) ==
                            setpointScheduled.SetPointHeat);
                    REQUIRE(Configuration::getTemperature(scheduledSetting->set_point_cool_x100()) ==
                            setpointScheduled.SetPointCool);
                    REQUIRE(Configuration::getTemperature(scheduledSetting->set_point_circulate_above_x100()) ==
                            setpointScheduled.SetPointCirculateAbove);
                    REQUIRE(Configuration::getTemperature(scheduledSetting->set_point_circulate_below_x100()) ==
                            setpointScheduled.SetPointCirculateBelow);
                }
            }
        }
    }
}