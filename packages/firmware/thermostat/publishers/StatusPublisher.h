#pragma once

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
                 ThermostatAction const& currentActions,
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
        sb.AppendFormat(",\"t\":%.1f", !std::isnan(operableTemperature) ? operableTemperature : 0.0f);

        if (fUsedExternalSensor)
        {
            sb.AppendFormat(",\"t2\":%.1f", !std::isnan(onboardTemperature) ? onboardTemperature : 0.0f);
        }

        sb.AppendFormat(",\"h\":%.1f", !std::isnan(onboardHumidity) ? onboardHumidity : 0.0f);

        sb.Append(",\"ca\":\"");
        appendActionsToStringBuilder(sb, currentActions);
        sb.Append("\"");

        // Configuration
        sb.AppendFormat(",\"cc\":{\"sh\":%.1f,\"sc\":%.1f,\"th\":%.2f",
                        Configuration::getTemperature(configuration.rootConfiguration().setPointHeat_x100()),
                        Configuration::getTemperature(configuration.rootConfiguration().setPointCool_x100()),
                        Configuration::getTemperature(configuration.rootConfiguration().threshold_x100()));

        sb.Append(",\"aa\":\"");
        appendActionsToStringBuilder(sb, configuration.rootConfiguration().allowedActions());
        sb.Append("\"}");

        // Measurements
        sb.Append(",\"v\":[");
        {
            bool isCommaNeeded = false;

            for (size_t idxAddress = 0; idxAddress < cAddressesFound; ++idxAddress)
            {
                if (std::isnan(rgExternalTemperatures[idxAddress]))
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

private:
    template <typename T>
    void appendActionsToStringBuilder(T& stringBuilder, ThermostatAction const& actions) const
    {
        if (!!(actions & ThermostatAction::Heat))
        {
            stringBuilder.Append("H");
        }

        if (!!(actions & ThermostatAction::Cool))
        {
            stringBuilder.Append("C");
        }

        if (!!(actions & ThermostatAction::Circulate))
        {
            stringBuilder.Append("R");
        }
    }
};