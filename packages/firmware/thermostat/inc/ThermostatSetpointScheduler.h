#pragma once

struct ThermostatSetpoint
{
    ThermostatSetpoint()
        : AllowedActions()
        , SetPointHeat()
        , SetPointCool()
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
};