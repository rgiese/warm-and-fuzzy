#pragma once

struct ThermostatSetpoint
{
    ThermostatSetpoint()
        : AllowedActions()
        , SetPointHeat()
        , SetPointCool()
        , SetPointCirculateAbove()
        , SetPointCirculateBelow()
    {
    }

    ThermostatSetpoint(ThermostatAction const allowedActions,
                       float const setPointHeat,
                       float const setPointCool,
                       float const setPointCirculateAbove,
                       float const setPointCirculateBelow)
        : AllowedActions(allowedActions)
        , SetPointHeat(setPointHeat)
        , SetPointCool(setPointCool)
        , SetPointCirculateAbove(setPointCirculateAbove)
        , SetPointCirculateBelow(setPointCirculateBelow)
    {
    }

    ThermostatSetpoint(Flatbuffers::Firmware::ThermostatSetting const& thermostatSetting)
        : AllowedActions(thermostatSetting.allowedActions())
        , SetPointHeat(Configuration::getTemperature(thermostatSetting.setPointHeat_x100()))
        , SetPointCool(Configuration::getTemperature(thermostatSetting.setPointCool_x100()))
        , SetPointCirculateAbove(Configuration::getTemperature(thermostatSetting.setPointCirculateAbove_x100()))
        , SetPointCirculateBelow(Configuration::getTemperature(thermostatSetting.setPointCirculateBelow_x100()))
    {
    }

    ThermostatAction AllowedActions;
    float SetPointHeat;
    float SetPointCool;
    float SetPointCirculateAbove;
    float SetPointCirculateBelow;

    bool operator==(ThermostatSetpoint const& rhs) const
    {
        return (AllowedActions == rhs.AllowedActions) && (SetPointHeat == rhs.SetPointHeat) &&
               (SetPointCool == rhs.SetPointCool) && (SetPointCirculateAbove == rhs.SetPointCirculateAbove) &&
               (SetPointCirculateBelow == rhs.SetPointCirculateBelow);
    }
};