#pragma once

#define __in
#define __out
#define __out_opt

#define RETURN_IF_FALSE(x) if (!(x)) { return false; }


template <typename T, std::size_t N>
constexpr std::size_t countof(T const (&)[N]) noexcept
{
    return N;
}


String floatToString(float const value)
{
    return !isnan(value) ? String::format("%.1f", value) : String("\"NaN\"");
}
