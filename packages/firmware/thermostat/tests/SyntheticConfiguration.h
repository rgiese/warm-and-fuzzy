#pragma once


class SyntheticConfiguration
{
public:
    SyntheticConfiguration()
        : m_Configuration()
        , m_fIsBuilt()
        , m_FlatbufferBuilder(1024)
        , m_ThermostatSettings()
    {
    }

public:
    //
    // Builders
    //

    void AddHoldSetting(uint32_t const holdUntil, ThermostatSetpoint const& thermostatSetpoint)
    {
        m_ThermostatSettings.emplace_back(Configuration::buildTemperature(thermostatSetpoint.SetPointHeat),
                                          Configuration::buildTemperature(thermostatSetpoint.SetPointCool),
                                          thermostatSetpoint.AllowedActions,
                                          ThermostatSettingType::Hold,
                                          0 /* padding */,
                                          holdUntil,
                                          DaysOfWeek::NONE,
                                          0 /* padding */,
                                          0);
    }

    void AddScheduledSetting(DaysOfWeek daysOfWeek,
                             uint16_t atMinutesSinceMidnight,
                             ThermostatSetpoint const& thermostatSetpoint)
    {
        m_ThermostatSettings.emplace_back(Configuration::buildTemperature(thermostatSetpoint.SetPointHeat),
                                          Configuration::buildTemperature(thermostatSetpoint.SetPointCool),
                                          thermostatSetpoint.AllowedActions,
                                          ThermostatSettingType::Scheduled,
                                          0 /* padding */,
                                          0,
                                          daysOfWeek,
                                          0 /* padding */,
                                          atMinutesSinceMidnight);
    }

    void Build()
    {
        REQUIRE(!m_fIsBuilt);

        auto const configurationRoot = Flatbuffers::Firmware::CreateThermostatConfigurationDirect(
            m_FlatbufferBuilder,
            0 /* external sensor ID */,
            Configuration::buildTemperature(0.5f) /* threshold */,
            600 /* cadence */,
            0 /* currentTimezoneUTCOffset */,
            0 /* nextTimezoneUTCOffset */,
            0 /* nextTimezoneChange */,
            &m_ThermostatSettings);

        Flatbuffers::Firmware::FinishThermostatConfigurationBuffer(m_FlatbufferBuilder, configurationRoot);

        char rgEncodedConfiguration[1024];
        uint16_t cchEncodedConfiguration = Z85::EncodeBytes(rgEncodedConfiguration,
                                                            countof(rgEncodedConfiguration),
                                                            m_FlatbufferBuilder.GetBufferPointer(),
                                                            m_FlatbufferBuilder.GetSize());

        REQUIRE(cchEncodedConfiguration != 0);

        REQUIRE(m_Configuration.SubmitUpdate(rgEncodedConfiguration, cchEncodedConfiguration) ==
                Configuration::ConfigUpdateResult::Accepted);

        REQUIRE(m_Configuration.AcceptPendingUpdates());

        m_fIsBuilt = true;
    }

    //
    // Accessors
    //

    operator Configuration const &() const
    {
        REQUIRE(m_fIsBuilt);
        return m_Configuration;
    }

    Flatbuffers::Firmware::ThermostatConfiguration const& rootConfiguration() const
    {
        REQUIRE(m_fIsBuilt);
        return m_Configuration.rootConfiguration();
    }

private:
    Configuration m_Configuration;
    bool m_fIsBuilt;

    flatbuffers::FlatBufferBuilder m_FlatbufferBuilder;
    std::vector<Flatbuffers::Firmware::ThermostatSetting> m_ThermostatSettings;
};
