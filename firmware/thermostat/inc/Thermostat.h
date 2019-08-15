#pragma once

#include <Particle.h>

class Configuration;

class Thermostat
{
public:
    union Actions
    {
        uint8_t Value;

        struct  // lowest bit to highest
        {
            bool Heat : 1;
            bool Cool : 1;
            bool Circulate : 1;
        };

        Actions()
        {
            Value = 0;
        }

        bool UpdateFromString(char const* const szActions)
        {
            // Parse
            Actions actions;

            for (char const* szAction = szActions; *szAction != 0; ++szAction)
            {
                switch (*szAction)
                {
                    case 'H':
                        actions.Heat = true;
                        break;

                    case 'C':
                        actions.Cool = true;
                        break;

                    case 'R':
                        actions.Circulate = true;
                        break;

                    default:
                        return false;
                }
            }

            // Commit
            *this = actions;

            return true;
        }

        template <typename T>
        void AppendToStringBuilder(T& stringBuilder) const
        {
            if (Heat)
            {
                stringBuilder.Append("H");
            }

            if (Cool)
            {
                stringBuilder.Append("C");
            }

            if (Circulate)
            {
                stringBuilder.Append("R");
            }
        }

        Actions Clamp() const
        {
            Actions clamped = *this;
            clamped.Value &= 0x7;

            return clamped;
        }

        Actions operator&(Actions const& other) const
        {
            Actions combinedActions = *this;
            combinedActions.Value &= other.Value;

            return combinedActions;
        }
    };

public:
    Thermostat();
    ~Thermostat();

public:
    void Initialize();

    void Apply(Configuration const& Configuration, float CurrentTemperature);

    Actions CurrentActions() const
    {
        return m_CurrentActions;
    }

private:
    // See ApplyActions() for explanation
    static pin_t constexpr sc_RelayPin_Heat = A0;
    static pin_t constexpr sc_RelayPin_SwitchOver = A1;
    static pin_t constexpr sc_RelayPin_Circulate = A2;

    Actions m_CurrentActions;

private:
    void ApplyActions(Actions const& Actions);
};


inline bool operator==(Thermostat::Actions const& lhs, Thermostat::Actions const& rhs)
{
    return lhs.Value == rhs.Value;
}


inline bool operator!=(Thermostat::Actions const& lhs, Thermostat::Actions const& rhs)
{
    return !(lhs == rhs);
}
