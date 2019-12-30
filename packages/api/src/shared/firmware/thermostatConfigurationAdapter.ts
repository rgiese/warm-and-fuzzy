import { Flatbuffers, flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";

import { ThermostatConfiguration } from "../db";
import { Z85Encode } from "../Z85";

import * as ActionsAdapter from "./actionsAdapter";
import * as OneWireIdAdapter from "./oneWireIdAdapter";

export interface FirmwareConfiguration {
  sh: number;
  sc: number;
  th: number;
  ca: number;
  aa: string;
  xs: string;
}

export function firmwareFromModel(thermostatConfiguration: ThermostatConfiguration): string {
  // Create buffer
  const firmwareConfigBuilder = new flatbuffers.Builder(128); // ...initial guess at size

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

  Flatbuffers.Firmware.ThermostatConfiguration.addAllowedActions(
    firmwareConfigBuilder,
    ActionsAdapter.firmwareFromModel(thermostatConfiguration.allowedActions)
  );

  Flatbuffers.Firmware.ThermostatConfiguration.addSetPointHeatX100(
    firmwareConfigBuilder,
    Math.round(thermostatConfiguration.setPointHeat * 100)
  );

  Flatbuffers.Firmware.ThermostatConfiguration.addSetPointCoolX100(
    firmwareConfigBuilder,
    Math.round(thermostatConfiguration.setPointCool * 100)
  );

  const firmwareConfigOffset = Flatbuffers.Firmware.ThermostatConfiguration.endThermostatConfiguration(
    firmwareConfigBuilder
  );

  // Finish top-level table
  firmwareConfigBuilder.finish(firmwareConfigOffset);

  // Extract and encode
  const firmwareConfigBytes = firmwareConfigBuilder.asUint8Array();

  const stringEncodedFirmwareConfig = Z85Encode(firmwareConfigBytes);

  const versionMagic = "1Z85";

  return versionMagic.concat(stringEncodedFirmwareConfig);
}

export function partialModelFromFirmware( // ...partial because we don't need cadence or external sensor ID reported back from the firmware
  firmwareConfiguration: Omit<FirmwareConfiguration, "ca" | "xs">
): Pick<ThermostatConfiguration, "setPointHeat" | "setPointCool" | "threshold" | "allowedActions"> {
  return {
    setPointHeat: firmwareConfiguration.sh,
    setPointCool: firmwareConfiguration.sc,
    threshold: firmwareConfiguration.th,
    allowedActions: ActionsAdapter.modelFromFirmware(firmwareConfiguration.aa),
  };
}
