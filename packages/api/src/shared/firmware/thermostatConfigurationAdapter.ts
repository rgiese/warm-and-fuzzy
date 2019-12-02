import { ThermostatConfiguration } from "../db";

import * as ActionsAdapter from "./actionsAdapter";

export interface FirmwareConfiguration {
  sh: number;
  sc: number;
  th: number;
  ca: number;
  aa: string;
  xs: string;
}

export function firmwareFromModel(
  thermostatConfiguration: ThermostatConfiguration
): FirmwareConfiguration {
  return {
    sh: thermostatConfiguration.setPointHeat,
    sc: thermostatConfiguration.setPointCool,
    th: thermostatConfiguration.threshold,
    ca: thermostatConfiguration.cadence,
    aa: ActionsAdapter.firmwareFromModel(thermostatConfiguration.allowedActions),
    xs: thermostatConfiguration.externalSensorId || "",
  };
}

export function partialModelFromFirmware( // ...partial because we don't need cadence reported back from the firmware
  firmwareConfiguration: Omit<FirmwareConfiguration, "ca">
): Pick<ThermostatConfiguration, "setPointHeat" | "setPointCool" | "threshold" | "allowedActions"> {
  return {
    setPointHeat: firmwareConfiguration.sh,
    setPointCool: firmwareConfiguration.sc,
    threshold: firmwareConfiguration.th,
    allowedActions: ActionsAdapter.modelFromFirmware(firmwareConfiguration.aa),
  };
}
