#include <Particle.h>

#include "inc/stdinc.h"

Thermostat::Thermostat()
    : m_CurrentActions(ThermostatAction::NONE)
{
}

Thermostat::~Thermostat()
{
}

void Thermostat::Initialize()
{
    // See ApplyActions() for explanation
    pinMode(sc_RelayPin_Heat, OUTPUT);
    pinMode(sc_RelayPin_SwitchOver, OUTPUT);
    pinMode(sc_RelayPin_Circulate, OUTPUT);

    ApplyActions(m_CurrentActions);
}

void Thermostat::Apply(Configuration const& Configuration,
                       ThermostatSetpoint const& ThermostatSetpoint,
                       float CurrentTemperature)
{
    // Compute proposed action, defaulting to continuing the current course of action
    ThermostatAction proposedActions = m_CurrentActions;

    float const setPointHeat = ThermostatSetpoint.SetPointHeat;
    float const setPointCool = ThermostatSetpoint.SetPointCool;
    float const threshold = Configuration::getTemperature(Configuration.rootConfiguration().threshold_x100());

    // Heat
    if (!!(m_CurrentActions & ThermostatAction::Heat) && CurrentTemperature > (setPointHeat + threshold))
    {
        // Turn off heat
        proposedActions &= ~ThermostatAction::Heat;
    }
    else if (!(m_CurrentActions & ThermostatAction::Heat) && CurrentTemperature < (setPointHeat - threshold))
    {
        // Turn on heat
        proposedActions |= ThermostatAction::Heat;
    }

    // Cool
    if (!!(m_CurrentActions & ThermostatAction::Cool) && CurrentTemperature < (setPointCool - threshold))
    {
        // Turn off cooling
        proposedActions &= ~ThermostatAction::Cool;
    }
    else if (!(m_CurrentActions & ThermostatAction::Cool) && CurrentTemperature > (setPointCool + threshold))
    {
        // Turn on cooling
        proposedActions |= ThermostatAction::Cool;
    }

    // Circulate - whenever allowed
    // FUTURE: circulate up/down to some threshold, or to some delta to another thermostat?
    proposedActions |= ThermostatAction::Circulate;

    // Intersect with allowed actions
    proposedActions = proposedActions & ThermostatSetpoint.AllowedActions;

    // Error checks
    if (!!(proposedActions & ThermostatAction::Heat) && !!(proposedActions & ThermostatAction::Cool))
    {
        // This shouldn't ever happen - bail on all actions to be safe.
        Serial.println("Thermostat: simultaneous heat and cool proposed, going inactive.");

        proposedActions &= ~(ThermostatAction::Heat | ThermostatAction::Cool);
    }

    // Commit
    m_CurrentActions = proposedActions;
    ApplyActions(m_CurrentActions);
}

void Thermostat::ApplyActions(ThermostatAction const& Actions)
{
    //
    // Relays are used in the following configuration:
    //
    // - Radiant heat
    //   - sc_RelayPin_Heat = call for heat
    //
    // - Heat pump
    //   - sc_RelayPin_Heat = call for work (heat [default] or cool)
    //   - sc_RelayPin_SwitchOver = switch over call for heat into call for cool
    //   - sc_RelayPin_Circulate = turn on circulator fan
    //
    // There are many heat pumps and not all are like mine,
    // but there's no value in adding the complexity to make this configurable for other setups until needed...
    //

    digitalWrite(sc_RelayPin_Heat, !!(Actions & (ThermostatAction::Heat | ThermostatAction::Cool)));
    digitalWrite(sc_RelayPin_SwitchOver, !!(Actions & ThermostatAction::Cool));
    digitalWrite(sc_RelayPin_Circulate,
                 !!(Actions & (ThermostatAction::Heat | ThermostatAction::Cool | ThermostatAction::Circulate)));
}
