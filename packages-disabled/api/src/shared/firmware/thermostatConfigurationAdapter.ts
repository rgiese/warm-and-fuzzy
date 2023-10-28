import * as OneWireIdAdapter from "./oneWireIdAdapter";
import * as ThermostatSettingAdapter from "./thermostatSettingAdapter";

import { Flatbuffers, flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatConfiguration, ThermostatSettings } from "../db";

import { Z85Encode } from "../Z85";
import moment from "moment-timezone";

export function firmwareFromModel(
  thermostatConfiguration: ThermostatConfiguration,
  thermostatSettings: ThermostatSettings
): string {
  // Create buffer
  const firmwareConfigBuilder: flatbuffers.Builder = new flatbuffers.Builder(128); // ...initial guess at size

  // Create settings array
  Flatbuffers.Firmware.ThermostatConfiguration.startThermostatSettingsVector(
    firmwareConfigBuilder,
    thermostatSettings.settings?.length ?? 0
  );

  thermostatSettings.settings?.forEach(thermostatSetting =>
    ThermostatSettingAdapter.createThermostatSetting(firmwareConfigBuilder, thermostatSetting)
  );

  const thermostatSettingsVector = firmwareConfigBuilder.endVector();

  // Start top-level table
  Flatbuffers.Firmware.ThermostatConfiguration.startThermostatConfiguration(firmwareConfigBuilder);

  // Set top-level fields
  Flatbuffers.Firmware.ThermostatConfiguration.addThresholdX100(
    firmwareConfigBuilder,
    Math.round(thermostatConfiguration.threshold * 100)
  );

  Flatbuffers.Firmware.ThermostatConfiguration.addCadence(
    firmwareConfigBuilder,
    thermostatConfiguration.cadence
  );

  if (thermostatConfiguration.externalSensorId) {
    Flatbuffers.Firmware.ThermostatConfiguration.addExternalSensorId(
      firmwareConfigBuilder,
      OneWireIdAdapter.firmwareFromModel(thermostatConfiguration.externalSensorId)
    );
  }

  if (thermostatConfiguration.timezone) {
    const timezoneInfo = moment.tz.zone(thermostatConfiguration.timezone);

    if (timezoneInfo) {
      // We rely on the timezoneInfo data being in sorted order
      const currentTime = Date.now(); // ms since UTC epoch, just like timezoneInfo.untils[]
      const idxCurrent = timezoneInfo.untils.findIndex(untilTime => untilTime > currentTime);

      if (idxCurrent > 0) {
        const currentOffset = timezoneInfo.offsets[idxCurrent];
        const nextOffset = timezoneInfo.offsets[idxCurrent + 1];

        const nextTimezoneChange = timezoneInfo.untils[idxCurrent] / 1000; // -> sec since UTC epoch

        Flatbuffers.Firmware.ThermostatConfiguration.addCurrentTimezoneUTCOffset(
          firmwareConfigBuilder,
          currentOffset
        );

        Flatbuffers.Firmware.ThermostatConfiguration.addNextTimezoneUTCOffset(
          firmwareConfigBuilder,
          nextOffset
        );

        Flatbuffers.Firmware.ThermostatConfiguration.addNextTimezoneChange(
          firmwareConfigBuilder,
          nextTimezoneChange
        );
      }
    }
  }

  Flatbuffers.Firmware.ThermostatConfiguration.addThermostatSettings(
    firmwareConfigBuilder,
    thermostatSettingsVector
  );

  // Finish top-level table
  const firmwareConfigOffset = Flatbuffers.Firmware.ThermostatConfiguration.endThermostatConfiguration(
    firmwareConfigBuilder
  );

  Flatbuffers.Firmware.ThermostatConfiguration.finishThermostatConfigurationBuffer(
    firmwareConfigBuilder,
    firmwareConfigOffset
  );

  // Extract and encode
  const firmwareConfigBytes = firmwareConfigBuilder.asUint8Array();

  const stringEncodedFirmwareConfig = Z85Encode(firmwareConfigBytes);

  // c.f. //packages/firmware/thermostat/Main.cpp#handleUpdatedConfig
  const versionMagic = "3Z85";

  return versionMagic.concat(stringEncodedFirmwareConfig);
}
