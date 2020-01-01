#pragma once

template <uint16_t cchBuffer>
class FixedStringBuffer
{
public:
    FixedStringBuffer()
        : m_rgBuffer()
        , m_cchUsed()
    {
    }

    char const* ToString() const
    {
        return m_rgBuffer;
    }

    bool Append(char const* const rgText)
    {
        uint16_t const cchToAppend_WithTerminator = static_cast<uint16_t>(strlen(rgText)) + 1;
        return Append(rgText, cchToAppend_WithTerminator);
    }

    template <uint16_t N>
    bool Append(char const (&rgText)[N])
    {
        return Append(rgText, N);
    }

    bool AppendFormat(char const* fmt, ...)
    {
        uint16_t const cchRemaining = cchBuffer - m_cchUsed;

        va_list args;
        va_start(args, fmt);
        int const cchWritten = vsnprintf(m_rgBuffer + m_cchUsed, cchRemaining, fmt, args);
        va_end(args);

        if ((cchWritten > 0) && (cchWritten < cchRemaining))
        {
            m_cchUsed += cchWritten;
            return true;
        }

        return false;
    }

private:
    char m_rgBuffer[cchBuffer];
    uint16_t m_cchUsed;

private:
    bool Append(char const* const rgText, uint16_t const cchToAppend_WithTerminator)
    {
        uint16_t const cchRemaining = cchBuffer - m_cchUsed;

        if (cchToAppend_WithTerminator > cchRemaining)
        {
            return false;
        }

        memcpy(m_rgBuffer + m_cchUsed, rgText, cchToAppend_WithTerminator);
        m_cchUsed += cchToAppend_WithTerminator - 1;

        return true;
    }
};