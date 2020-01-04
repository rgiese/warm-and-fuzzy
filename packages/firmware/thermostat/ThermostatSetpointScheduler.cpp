#include <Particle.h>

#include "inc/stdinc.h"

ThermostatSetpointScheduler::ThermostatSetpointScheduler()
{
}

ThermostatSetpointScheduler::~ThermostatSetpointScheduler()
{
}

ThermostatSetpoint ThermostatSetpointScheduler::getCurrentThermostatSetpoint(Configuration const& Configuration) const
{
    auto const pvThermostatSettings = Configuration.rootConfiguration().thermostatSettings();

    if (!pvThermostatSettings)
    {
        return getDefaultThermostatSetpoint(Configuration);
    }

    //
    // See if there's an applicable Hold
    //

    uint32_t constexpr c_idxNotSet = static_cast<uint32_t>(-1);

    uint32_t const timeNow = Time.now();  // seconds since UTC epoch

    {
        uint32_t idxEarliestHoldUntil = c_idxNotSet;

        for (uint32_t idxSetting = 0; idxSetting < pvThermostatSettings->size(); ++idxSetting)
        {
            auto const& thermostatSetting = *pvThermostatSettings->Get(idxSetting);

            if (thermostatSetting.type() != ThermostatSettingType::Hold)
            {
                // Not a hold
                continue;
            }

            if (thermostatSetting.holdUntil() < timeNow)
            {
                // No longer valid
                continue;
            }

            if (idxEarliestHoldUntil == c_idxNotSet)
            {
                // There's no better (earlier) setting yet, adopt this one
                idxEarliestHoldUntil = idxSetting;
                continue;
            }

            if (thermostatSetting.holdUntil() < pvThermostatSettings->Get(idxEarliestHoldUntil)->holdUntil())
            {
                // This setting is earlier, adopt it
                idxEarliestHoldUntil = idxSetting;
            }
        }

        if (idxEarliestHoldUntil != c_idxNotSet)
        {
            // We found a suitable setting - return it
            return ThermostatSetpoint(*pvThermostatSettings->Get(idxEarliestHoldUntil));
        }
    }

    //
    // See if there's an applicable Scheduled setting
    //

    {
        // c.f. https://docs.particle.io/reference/device-os/firmware/photon/#hour-
        uint16_t const currentMinutesSinceMidnight = Time.hour(timeNow) * 60 + Time.minute(timeNow);
        uint8_t const currentScalarDayOfWeek =
            static_cast<uint8_t>(Time.weekday(timeNow));  // Sunday = 1, ...; c.f. getScalarDayOfWeek

        uint16_t const currentMinutesSinceStartOfWeek =
            currentMinutesSinceMidnight + (currentScalarDayOfWeek - 1) * (24 * 60);

        uint32_t idxClosestScheduled = c_idxNotSet;
        uint16_t closestScheduledMinutesSinceStartOfWeek = 0;

        uint32_t idxLatestScheduled = c_idxNotSet;
        uint16_t latestScheduledMinutesSinceStartOfWeek = 0;

        for (uint32_t idxSetting = 0; idxSetting < pvThermostatSettings->size(); ++idxSetting)
        {
            auto const& thermostatSetting = *pvThermostatSettings->Get(idxSetting);

            if (thermostatSetting.type() != ThermostatSettingType::Scheduled)
            {
                // Not a scheduled setting
                continue;
            }

            for (uint8_t idxDayOfWeekEnum = 0; idxDayOfWeekEnum < 7; ++idxDayOfWeekEnum)
            {
                DaysOfWeek const settingDayOfWeek = Flatbuffers::Firmware::EnumValuesDaysOfWeek()[idxDayOfWeekEnum];

                if (!(settingDayOfWeek & thermostatSetting.daysOfWeek()))
                {
                    continue;
                }

                uint16_t const settingAtMinutesSinceMidnight = thermostatSetting.atMinutesSinceMidnight();
                uint8_t const settingScalarDayOfWeek = getScalarDayOfWeek(settingDayOfWeek);

                uint16_t const settingAtMinutesSinceStartOfWeek =
                    settingAtMinutesSinceMidnight + (settingScalarDayOfWeek - 1) * (24 * 60);

                // Check if this could be the closest (at or before) scheduled setting
                if (settingAtMinutesSinceStartOfWeek <= currentMinutesSinceStartOfWeek)
                {
                    if ((idxClosestScheduled == c_idxNotSet)  // ...there is no closest setting
                        || (settingAtMinutesSinceStartOfWeek >
                            closestScheduledMinutesSinceStartOfWeek))  // ...this setting is closer
                    {
                        // Adopt this one
                        idxClosestScheduled = idxSetting;
                        closestScheduledMinutesSinceStartOfWeek = settingAtMinutesSinceStartOfWeek;
                    }
                }

                // Check if this could be the latest scheduled setting
                if ((idxLatestScheduled == 0) ||
                    (settingAtMinutesSinceStartOfWeek > latestScheduledMinutesSinceStartOfWeek))
                {
                    // Adopt this one
                    idxLatestScheduled = idxSetting;
                    latestScheduledMinutesSinceStartOfWeek = settingAtMinutesSinceStartOfWeek;
                }
            }
        }

        // If we found a suitable setting, return it
        if (idxClosestScheduled != c_idxNotSet)
        {
            return ThermostatSetpoint(*pvThermostatSettings->Get(idxClosestScheduled));
        }

        // We may be at the beginning of the week - use the latest setting in the week if available
        if (idxLatestScheduled != c_idxNotSet)
        {
            return ThermostatSetpoint(*pvThermostatSettings->Get(idxLatestScheduled));
        }
    }

    // Fall back on default
    return getDefaultThermostatSetpoint(Configuration);
}

ThermostatSetpoint ThermostatSetpointScheduler::getDefaultThermostatSetpoint(Configuration const& Configuration) const
{
    ThermostatSetpoint thermostatSetpoint;

    thermostatSetpoint.SetPointHeat =
        Configuration::getTemperature(Configuration.rootConfiguration().setPointHeat_x100());
    thermostatSetpoint.SetPointCool =
        Configuration::getTemperature(Configuration.rootConfiguration().setPointCool_x100());
    thermostatSetpoint.AllowedActions = Configuration.rootConfiguration().allowedActions();

    return thermostatSetpoint;
}

uint8_t ThermostatSetpointScheduler::getScalarDayOfWeek(DaysOfWeek const dayOfWeek) const
{
    switch (dayOfWeek)
    {
        case DaysOfWeek::Sunday:
            return 1;
        case DaysOfWeek::Monday:
            return 2;
        case DaysOfWeek::Tuesday:
            return 3;
        case DaysOfWeek::Wednesday:
            return 4;
        case DaysOfWeek::Thursday:
            return 5;
        case DaysOfWeek::Friday:
            return 6;
        case DaysOfWeek::Saturday:
            return 7;
        default:
            Serial.printlnf("!! Unrecognized day of week %u", static_cast<int>(dayOfWeek));
            return 1;
    }
}