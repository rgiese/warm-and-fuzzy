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
    pinMode(sc_RelayPin_Heat, OUTPUT);
    pinMode(sc_RelayPin_Cool, OUTPUT);
    pinMode(sc_RelayPin_Circulate, OUTPUT);

    ApplyActions(m_CurrentActions);
}

void Thermostat::Apply(Configuration const& Configuration, float CurrentTemperature)
{
    float const setPoint_Lower = Configuration.SetPoint() - Configuration.Threshold();
    float const setPoint_Upper = Configuration.SetPoint() + Configuration.Threshold();

    // Compute proposed action, defaulting to continuing the current course of action
    Thermostat::Actions proposedActions = m_CurrentActions;

    // Heat
    if (m_CurrentActions.Heat && CurrentTemperature > setPoint_Upper)
    {
        proposedActions.Heat = false;
    }
    else if (!m_CurrentActions.Heat && CurrentTemperature < setPoint_Lower)
    {
        proposedActions.Heat = true;
    }

    // Cool
    if (m_CurrentActions.Cool && CurrentTemperature < setPoint_Lower)
    {
        proposedActions.Cool = false;
    }
    else if (!m_CurrentActions.Cool && CurrentTemperature > setPoint_Upper)
    {
        proposedActions.Cool = true;
    }

    // Circulate (consider as supplementary cooling)
    if (m_CurrentActions.Circulate && CurrentTemperature < setPoint_Lower)
    {
        proposedActions.Circulate = false;
    }
    else if (!m_CurrentActions.Circulate && CurrentTemperature > setPoint_Upper)
    {
        proposedActions.Circulate = true;
    }

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
    digitalWrite(sc_RelayPin_Heat, Actions.Heat);
    digitalWrite(sc_RelayPin_Cool, Actions.Cool);
    digitalWrite(sc_RelayPin_Circulate, Actions.Circulate);
}
