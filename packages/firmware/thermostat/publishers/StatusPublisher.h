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
    void Publish(Configuration const& configuration,
                 Thermostat::Actions const& currentActions,
                 bool const fUsedExternalSensor,
                 float const operableTemperature,
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

        // Status
        sb.AppendFormat(",\"t\":%.1f", !isnan(operableTemperature) ? operableTemperature : 0.0f);

        if (fUsedExternalSensor)
        {
            sb.AppendFormat(",\"t2\":%.1f", !isnan(onboardTemperature) ? onboardTemperature : 0.0f);
        }

        sb.AppendFormat(",\"h\":%.1f", !isnan(onboardHumidity) ? onboardHumidity : 0.0f);

        sb.Append(",\"ca\":\"");
        currentActions.AppendToStringBuilder(sb);
        sb.Append("\"");

        // Configuration
        sb.AppendFormat(",\"cc\":{\"sh\":%.1f,\"sc\":%.1f,\"th\":%.2f",
                        configuration.SetPointHeat(),
                        configuration.SetPointCool(),
                        configuration.Threshold());

        sb.Append(",\"aa\":\"");
        configuration.AllowedActions().AppendToStringBuilder(sb);
        sb.Append("\"}");

        // Measurements
        sb.Append(",\"v\":[");
        {
            bool isCommaNeeded = false;

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
        static_strlen("{'ts':‭4294967295‬,'ser':‭4294967295‬")      // Header
        + static_strlen(",'t':-100.0,'t2':-100.0,'h':100.0,'ca':'HCR'")     // Status
        + static_strlen(",cc:{'sh':10.0,'sc':10.0,'th':10.00,'aa':'HCR'}")  // Configuration
        + static_strlen(",'v':[]}")                                         // Measurements
        + c_cOneWireDevices_Max *
              static_strlen("{'id':'001122334455667788','t':-100.0,'h':100.0},")  // Values from external sensors
        + 4;                                                                      // Safety margin

private:
    QueuedPublisher<cchEventData, 8> m_QueuedPublisher;
    uint32_t m_SerialNumber;
};