#pragma once

#include <Particle.h>

#include "../inc/FixedStringBuffer.h"
#include "../inc/QueuedPublisher.h"

class StatusPublisher
{
public:
    StatusPublisher()
        : m_QueuedPublisher("status")
        , m_SerialNumber()
    {
    }

    ~StatusPublisher()
    {
    }

public:
    void Publish(Thermostat::Actions const& currentActions,
                 float const onboardTemperature,
                 float const onboardHumidity,
                 OneWireAddress const* const rgAddresses,
                 size_t const cAddressesFound,
                 float const* const rgExternalTemperatures)
    {
        FixedStringBuffer<cchEventData> sb;

        // Header
        sb.AppendFormat("{\"ts\":%u,\"ser\":%u", Time.now(), m_SerialNumber);
        ++m_SerialNumber;

        // Current actions
        sb.Append(",\"ca\":\"");

        if (currentActions.Heat)
        {
            sb.Append("H");
        }

        if (currentActions.Cool)
        {
            sb.Append("C");
        }

        if (currentActions.Circulate)
        {
            sb.Append("R");
        }

        sb.Append("\"");

        // Measurements
        sb.Append(",\"v\":[");
        {
            bool isCommaNeeded = false;

            if (!isnan(onboardTemperature) && !isnan(onboardHumidity))
            {
                sb.AppendFormat("{\"t\":%.1f,\"h\":%.1f}", onboardTemperature, onboardHumidity);

                isCommaNeeded = true;
            }

            for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
            {
                if (isnan(rgExternalTemperatures[idxAddress]))
                {
                    continue;
                }

                if (isCommaNeeded)
                {
                    sb.Append(",");
                }

                char rgAddress[OneWireAddress::sc_cchAsHexString_WithTerminator];
                rgAddresses[idxAddress].ToString(rgAddress);

                sb.AppendFormat("{\"id\":\"%s\",\"t\":%.1f}", rgAddress, rgExternalTemperatures[idxAddress]);

                isCommaNeeded = true;
            }
        }
        sb.AppendFormat("]}");

        m_QueuedPublisher.Publish(sb.ToString());
    }

private:
    static size_t constexpr cchEventData =
        static_strlen("{'ts':‭4294967295‬,'ser':‭4294967295‬,'ca':'HCR','v':[]}")  // Top-level elements
        + static_strlen("{'t':-100.0,'h':100.0},")  // Values from on-board sensors
        + c_cOneWireDevices_Max *
              static_strlen("{'id':'001122334455667788','t':-100.0,'h':100.0},")  // Values from external sensors
        + 4;

private:
    QueuedPublisher<cchEventData, 8> m_QueuedPublisher;
    uint32_t m_SerialNumber;
};