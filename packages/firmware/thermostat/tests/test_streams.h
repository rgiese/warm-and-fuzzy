#pragma once

// c.f. https://github.com/catchorg/Catch2/blob/master/docs/tostring.md

inline std::ostream& operator<<(std::ostream& os, ThermostatSetpoint const& value)
{
    os << (!!(value.AllowedActions & Flatbuffers::Firmware::ThermostatAction::Heat) ? 'H' : '_')
       << (!!(value.AllowedActions & Flatbuffers::Firmware::ThermostatAction::Cool) ? 'C' : '_')
       << (!!(value.AllowedActions & Flatbuffers::Firmware::ThermostatAction::Circulate) ? 'R' : '_') << "/"
       << value.SetPointHeat << "/" << value.SetPointCool;

    return os;
}
