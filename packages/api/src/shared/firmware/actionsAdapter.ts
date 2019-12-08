import * as GraphQL from "../../../generated/graphqlTypes";

//
// Convert Set<GraphQL.ThermostatAction> to/from firmware shorthand notation, e.g. "HCR"
//

const mapModelToFirmwareCharacters = new Map<GraphQL.ThermostatAction, string>([
  [GraphQL.ThermostatAction.Heat, "H"],
  [GraphQL.ThermostatAction.Cool, "C"],
  [GraphQL.ThermostatAction.Circulate, "R"],
]);

const mapFirmwareCharactersToModel = new Map<string, GraphQL.ThermostatAction>([
  ["H", GraphQL.ThermostatAction.Heat],
  ["C", GraphQL.ThermostatAction.Cool],
  ["R", GraphQL.ThermostatAction.Circulate],
]);

const throwUndefinedModelAction = (a: GraphQL.ThermostatAction): string => {
  throw new Error(`Unrecognized action '${a}'`);
};

const throwUndefinedFirmwareAction = (a: string): GraphQL.ThermostatAction => {
  throw new Error(`Unrecognized action '${a}'`);
};

export function firmwareFromModel(actions?: Set<GraphQL.ThermostatAction>): string {
  if (actions) {
    return Array.from(actions)
      .map((a): string => mapModelToFirmwareCharacters.get(a) || throwUndefinedModelAction(a))
      .join("");
  } else {
    return "";
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
          mapFirmwareCharactersToModel.get(c) || throwUndefinedFirmwareAction(c)
      )
  );
}
