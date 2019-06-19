#include <Particle.h>

#include "inc/CoreDefs.h"

#include "inc/Activity.h"
#include "inc/Thermostat.h"

#include "inc/Configuration.h"

Thermostat::Thermostat()
    : m_CurrentActions()
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

void Thermostat::Apply(Configuration const& Configuration, float CurrentTemperature)
{
    // Compute proposed action, defaulting to continuing the current course of action
    Thermostat::Actions proposedActions = m_CurrentActions;

    // Heat
    if (m_CurrentActions.Heat && CurrentTemperature > (Configuration.SetPointHeat() + Configuration.Threshold()))
    {
        proposedActions.Heat = false;
    }
    else if (!m_CurrentActions.Heat && CurrentTemperature < (Configuration.SetPointHeat() - Configuration.Threshold()))
    {
        proposedActions.Heat = true;
    }

    // Cool
    if (m_CurrentActions.Cool && CurrentTemperature < (Configuration.SetPointCool() - Configuration.Threshold()))
    {
        proposedActions.Cool = false;
    }
    else if (!m_CurrentActions.Cool && CurrentTemperature > (Configuration.SetPointCool() + Configuration.Threshold()))
    {
        proposedActions.Cool = true;
    }

    // Circulate - FUTURE
    proposedActions.Circulate = false;

    // Intersect with allowed actions
    proposedActions = proposedActions & Configuration.AllowedActions();

    // Error checks
    if (proposedActions.Heat && proposedActions.Cool)
    {
        // This shouldn't ever happen - bail on all actions to be safe.
        Serial.println("Thermostat: simultaneous heat and cool proposed, going inactive.");

        proposedActions.Heat = false;
        proposedActions.Cool = false;
    }

    // Commit
    m_CurrentActions = proposedActions;
    ApplyActions(m_CurrentActions);
}

void Thermostat::ApplyActions(Thermostat::Actions const& Actions)
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

    digitalWrite(sc_RelayPin_Heat, Actions.Heat || Actions.Cool);
    digitalWrite(sc_RelayPin_SwitchOver, Actions.Cool);
    digitalWrite(sc_RelayPin_Circulate, Actions.Heat || Actions.Cool || Actions.Circulate);
}
