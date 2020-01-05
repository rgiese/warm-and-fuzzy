#pragma once

struct ThermostatSetpoint
{
    ThermostatSetpoint()
        : AllowedActions()
        , SetPointHeat()
        , SetPointCool()
    {
    }

    ThermostatSetpoint(ThermostatAction const allowedActions, float const setPointHeat, float const setPointCool)
        : AllowedActions(allowedActions)
        , SetPointHeat(setPointHeat)
        , SetPointCool(setPointCool)
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

    bool operator==(ThermostatSetpoint const& rhs) const
    {
        return (AllowedActions == rhs.AllowedActions) && (SetPointHeat == rhs.SetPointHeat) &&
               (SetPointCool == rhs.SetPointCool);
    }
};

class ThermostatSetpointScheduler
{
public:
    ThermostatSetpointScheduler();
    ~ThermostatSetpointScheduler();

public:
    ThermostatSetpoint getCurrentThermostatSetpoint(Configuration const& Configuration) const;

private:
    uint8_t getScalarDayOfWeek(DaysOfWeek const dayOfWeek) const;
};