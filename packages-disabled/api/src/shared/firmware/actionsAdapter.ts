import * as GraphQL from "../../../generated/graphqlTypes";
import { Flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";

//
// Convert Set<GraphQL.ThermostatAction> to/from firmware shorthand notation
//

const mapModelToFirmwareEnum = new Map<
  GraphQL.ThermostatAction,
  Flatbuffers.Firmware.ThermostatAction
>([
  [GraphQL.ThermostatAction.Heat, Flatbuffers.Firmware.ThermostatAction.Heat],
  [GraphQL.ThermostatAction.Cool, Flatbuffers.Firmware.ThermostatAction.Cool],
  [GraphQL.ThermostatAction.Circulate, Flatbuffers.Firmware.ThermostatAction.Circulate],
]);

const mapFirmwareCharactersToModel = new Map<string, GraphQL.ThermostatAction>([
  ["H", GraphQL.ThermostatAction.Heat],
  ["C", GraphQL.ThermostatAction.Cool],
  ["R", GraphQL.ThermostatAction.Circulate],
]);

const throwUndefinedModelAction = (
  a: GraphQL.ThermostatAction
): Flatbuffers.Firmware.ThermostatAction => {
  throw new Error(`Unrecognized action '${a}'`);
};

const throwUndefinedFirmwareAction = (a: string): GraphQL.ThermostatAction => {
  throw new Error(`Unrecognized action '${a}'`);
};

export function firmwareFromModel(
  actions?: Set<GraphQL.ThermostatAction>
): Flatbuffers.Firmware.ThermostatAction {
  if (actions) {
    return Array.from(actions)
      .map(
        (a): Flatbuffers.Firmware.ThermostatAction =>
          mapModelToFirmwareEnum.get(a) ?? throwUndefinedModelAction(a)
      )
      .reduce((accumulatedValue, currentValue) => accumulatedValue | currentValue);
  } else {
    return 0;
  }
}

export function modelFromFirmware(
  actions: string | null
): Set<GraphQL.ThermostatAction> | undefined {
  if (!actions || !actions.length) {
    return undefined;
  }

  return new Set(
    actions
      .split("")
      .map(
        (c): GraphQL.ThermostatAction =>
          mapFirmwareCharactersToModel.get(c) ?? throwUndefinedFirmwareAction(c)
      )
  );
}
