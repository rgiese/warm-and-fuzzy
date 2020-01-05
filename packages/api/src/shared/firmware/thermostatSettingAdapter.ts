import { Flatbuffers, flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../../generated/graphqlTypes";

import { ThermostatSetting } from "../db";

import * as ActionsAdapter from "./actionsAdapter";
import * as DaysOfWeekAdapter from "./daysOfWeekAdapter";
import * as TemperatureAdapter from "./temperatureAdapter";

function thermostatSettingType(
  thermostatSetting: ThermostatSetting
): Flatbuffers.Firmware.ThermostatSettingType {
  if (thermostatSetting.type === GraphQL.ThermostatSettingType.Hold) {
    return Flatbuffers.Firmware.ThermostatSettingType.Hold;
  }

  if (thermostatSetting.type === GraphQL.ThermostatSettingType.Scheduled) {
    return Flatbuffers.Firmware.ThermostatSettingType.Scheduled;
  }

  throw new Error(`Unexpected thermostat setting type ${thermostatSetting.type}`);
}

export function createThermostatSetting(
  firmwareConfigBuilder: flatbuffers.Builder,
  thermostatSetting: ThermostatSetting
): void {
  const holdUntil =
    thermostatSetting.type === GraphQL.ThermostatSettingType.Hold
      ? (thermostatSetting.holdUntil?.valueOf() || 0) / 1000
      : 0;

  Flatbuffers.Firmware.ThermostatSetting.createThermostatSetting(
    firmwareConfigBuilder,
    TemperatureAdapter.firmwareFromModel(thermostatSetting.setPointHeat),
    TemperatureAdapter.firmwareFromModel(thermostatSetting.setPointCool),
    ActionsAdapter.firmwareFromModel(thermostatSetting.allowedActions),
    thermostatSettingType(thermostatSetting),
    0,
    holdUntil,
    DaysOfWeekAdapter.firmwareFromModel(thermostatSetting.daysOfWeek),
    0,
    thermostatSetting.atMinutesSinceMidnight || 0
  );
}