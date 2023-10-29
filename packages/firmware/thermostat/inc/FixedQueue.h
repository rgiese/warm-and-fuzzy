#pragma once

template <uint16_t cchItem_Max, uint16_t nItems_Max, bool fEvictOldest = true>
class FixedQueue
{
public:
    typedef uint16_t size_type;

public:
    FixedQueue() : m_rgszQueue(), m_nItems(), m_idxFront()
    {
    }

    ~FixedQueue()
    {
    }

public:
    bool empty() const
    {
        return (size() == 0);
    }

    size_type size() const
    {
        return m_nItems;
    }

    size_type constexpr capacity()
    {
        return nItems_Max;
    }

    char const* front() const
    {
        if (empty())
        {
            return nullptr;
        }

        return m_rgszQueue[m_idxFront];
    }

    void pop()
    {
        if (empty())
        {
            return;
        }

        m_nItems -= 1;
        m_idxFront = (m_idxFront + 1) % capacity();
    }

    void push(char const* const szData)
    {
        bool const fIsFull = size() == capacity();

        if (!fEvictOldest && fIsFull)
        {
            return;
        }

        size_type const cchToCopy_WithTerminator = static_cast<size_type>(strlen(szData)) + 1;

        if (cchToCopy_WithTerminator > cchItem_Max)
        {
            return;
        }

        size_type const idxNext = (m_idxFront + m_nItems) % capacity();

        memcpy(m_rgszQueue[idxNext], szData, cchToCopy_WithTerminator);

        if (fIsFull)
        {
            // Advance front, keep size
            m_idxFront = (m_idxFront + 1) % capacity();
        }
        else
        {
            // Keep front, advance size
            ++m_nItems;
        }
    }

private:
    char m_rgszQueue[nItems_Max][cchItem_Max];
    size_type m_nItems;
    size_type m_idxFront;
};