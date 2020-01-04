#pragma once

struct ThermostatSetpoint
{
    ThermostatSetpoint()
        : AllowedActions()
        , SetPointHeat()
        , SetPointCool()
    {
    }

    ThermostatSetpoint(Flatbuffers::Firmware::ThermostatSetting const& thermostatSetting)
        : AllowedActions(thermostatSetting.allowedActions())
        , SetPointHeat(Configuration::getTemperature(thermostatSetting.setPointHeat_x100()))
        , SetPointCool(Configuration::getTemperature(thermostatSetting.setPointCool_x100()))
    {
    }

    ThermostatAction AllowedActions;
    float SetPointHeat;
    float SetPointCool;
};

class ThermostatSetpointScheduler
{
public:
    ThermostatSetpointScheduler();
    ~ThermostatSetpointScheduler();

public:
    ThermostatSetpoint getCurrentThermostatSetpoint(Configuration const& Configuration) const;

private:
    ThermostatSetpoint getDefaultThermostatSetpoint(Configuration const& Configuration) const;
    uint8_t getScalarDayOfWeek(DaysOfWeek const dayOfWeek) const;
};