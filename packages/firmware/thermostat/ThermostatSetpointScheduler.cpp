#include <Particle.h>

#include "inc/stdinc.h"

ThermostatSetpointScheduler::ThermostatSetpointScheduler()
{
}

ThermostatSetpointScheduler::~ThermostatSetpointScheduler()
{
}

ThermostatSetpoint ThermostatSetpointScheduler::getCurrentThermostatSetpoint(Configuration const& Configuration) const
{
    ThermostatSetpoint thermostatSetpoint;

    thermostatSetpoint.SetPointHeat =
        Configuration::getTemperature(Configuration.rootConfiguration().setPointHeat_x100());
    thermostatSetpoint.SetPointCool =
        Configuration::getTemperature(Configuration.rootConfiguration().setPointCool_x100());
    thermostatSetpoint.AllowedActions = Configuration.rootConfiguration().allowedActions();

    return thermostatSetpoint;
}
