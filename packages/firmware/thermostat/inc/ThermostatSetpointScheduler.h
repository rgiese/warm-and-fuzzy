#pragma once

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