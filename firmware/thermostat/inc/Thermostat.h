#pragma once

#include <Particle.h>

class Thermostat
{
public:
    union AllowedActions
    {
        uint8_t Value;

        struct  // lowest bit to highest
        {
            bool Heat : 1;
            bool Cool : 1;
            bool Circulate : 1;
        };

        AllowedActions()
        {
            Value = 0;
        }

        bool UpdateFromString(char const* const szAllowedActions)
        {
            // Parse
            AllowedActions allowedActions;

            for (char const* szAction = szAllowedActions; *szAction != 0; ++szAction)
            {
                switch (*szAction)
                {
                    case 'H':
                        allowedActions.Heat = true;
                        break;

                    case 'C':
                        allowedActions.Cool = true;
                        break;

                    case 'R':
                        allowedActions.Circulate = true;
                        break;

                    default:
                        return false;
                }
            }

            // Commit
            *this = allowedActions;

            return true;
        }
    };
};

bool operator==(Thermostat::AllowedActions const& lhs, Thermostat::AllowedActions const& rhs)
{
    return lhs.Value == rhs.Value;
}

bool operator!=(Thermostat::AllowedActions const& lhs, Thermostat::AllowedActions const& rhs)
{
    return !(lhs == rhs);
}