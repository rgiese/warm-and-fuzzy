#pragma once

#include <Particle.h>

#define __in
#define __out
#define __out_opt

#define RETURN_IF_FALSE(x) \
    if (!(x))              \
    {                      \
        return false;      \
    }


template <typename T, std::size_t N>
constexpr std::size_t countof(T const (&)[N]) noexcept
{
    return N;
}

template <typename T, std::size_t N>
constexpr std::size_t static_strlen(T const (&)[N]) noexcept
{
    return N - 1;
}
