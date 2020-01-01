#pragma once

#include <Particle.h>

#include "FixedQueue.h"

template <uint16_t cchEvent_Max, uint16_t nEvents_Max, bool fEvictOldest = true>
class QueuedPublisher
{
public:
    QueuedPublisher(char const* const szEventName)
        : m_Queue()
        , m_szEventName(szEventName)
    {
    }

    ~QueuedPublisher()
    {
    }

public:
    void Publish(char const* const szEventData)
    {
        // Try to empty queue (i.e. backlog)
        while (Particle.connected() && !m_Queue.empty())
        {
            Activity publishActivity("QP.PublishFromQueue");

            if (ParticlePublish(m_Queue.front()))
            {
                m_Queue.pop();
            }
            else
            {
                // Stop trying to empty queue (might have lost connectivity or got rate-limited)
                break;
            }

            // Wait a second before publishing again (otherwise Particle will throttle us)
            delay(1000);
        }

        // If there's still a queue, just enqueue the latest data
        if (!m_Queue.empty())
        {
            m_Queue.push(szEventData);
            return;
        }

        // Try to publish
        {
            Activity publishActivity("QP.Publish");

            if (!ParticlePublish(szEventData))
            {
                m_Queue.push(szEventData);
            }
        }
    }

private:
    FixedQueue<cchEvent_Max, nEvents_Max, fEvictOldest> m_Queue;
    char const* const m_szEventName;

    bool ParticlePublish(char const* const szEventData)
    {
        //
        // Publish WITH_ACK to ensure that the cloud has acknowledged delivery of the event.
        // Without WITH_ACK, we may falsely succeed (and thus lose data)
        // when the network has gone away but the Particle OS hasn't yet refreshed its connectivity state
        // to realize that the network is gone.
        //
        bool const fSucceeded = Particle.publish(m_szEventName, szEventData, 60 /* TTL, unused */, PRIVATE | WITH_ACK);

        if (fSucceeded)
        {
            Serial.printlnf("Published %s: %s", m_szEventName, szEventData);
        }

        return fSucceeded;
    }
};