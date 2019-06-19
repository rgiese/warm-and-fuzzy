#include <Particle.h>

#include "inc/CoreDefs.h"

#include "inc/Activity.h"
#include "inc/Thermostat.h"

#include "inc/Configuration.h"

Thermostat::Thermostat()
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

    Apply(Actions());
}

void Thermostat::Apply(Thermostat::Actions const& Actions)
{
    digitalWrite(sc_RelayPin_Heat, Actions.Heat);
    digitalWrite(sc_RelayPin_Cool, Actions.Cool);
    digitalWrite(sc_RelayPin_Circulate, Actions.Circulate);
}
