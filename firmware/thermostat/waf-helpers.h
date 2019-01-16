#pragma once

template <typename T, std::size_t N>
constexpr std::size_t countof(T const (&)[N]) noexcept
{
    return N;
}


String floatToString(float const value)
{
    return !isnan(value) ? String::format("%.1f", value) : String("\"NaN\"");
}
