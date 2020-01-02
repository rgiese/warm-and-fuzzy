#pragma once

class Thermostat
{
public:
    Thermostat();
    ~Thermostat();

public:
    void Initialize();

    void Apply(Configuration const& Configuration, float CurrentTemperature);

    ThermostatAction CurrentActions() const
    {
        return m_CurrentActions;
    }

private:
    // See ApplyActions() for explanation
    static pin_t constexpr sc_RelayPin_Heat = A0;
    static pin_t constexpr sc_RelayPin_SwitchOver = A1;
    static pin_t constexpr sc_RelayPin_Circulate = A2;

    ThermostatAction m_CurrentActions;

private:
    void ApplyActions(ThermostatAction const& Actions);
};
