#pragma once

#include <Particle.h>

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

        Actions Clamp() const
        {
            Actions clamped = *this;
            clamped.Value &= 0x7;

            return clamped;
        }
    };

public:
    Thermostat();
    ~Thermostat();

public:
    void Initialize();

private:
    static pin_t constexpr sc_RelayPin_Heat = A0;
    static pin_t constexpr sc_RelayPin_Cool = A1;
    static pin_t constexpr sc_RelayPin_Circulate = A2;

private:
    void Apply(Actions const& Actions);
};


inline bool operator==(Thermostat::Actions const& lhs, Thermostat::Actions const& rhs)
{
    return lhs.Value == rhs.Value;
}


inline bool operator!=(Thermostat::Actions const& lhs, Thermostat::Actions const& rhs)
{
    return !(lhs == rhs);
}
