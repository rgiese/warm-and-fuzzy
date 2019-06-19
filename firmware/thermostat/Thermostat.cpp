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

void Thermostat::Apply(Configuration const& Configuration, float CurrentTemperature, float CurrentHumidity)
{
    UNREFERENCED_PARAMETER(CurrentHumidity);

    ApplyActions(m_CurrentActions);
}

void Thermostat::ApplyActions(Thermostat::Actions const& Actions)
{
    digitalWrite(sc_RelayPin_Heat, Actions.Heat);
    digitalWrite(sc_RelayPin_Cool, Actions.Cool);
    digitalWrite(sc_RelayPin_Circulate, Actions.Circulate);
}
