import * as GraphQL from "../../../generated/graphqlTypes";
import { ThermostatConfiguration } from "../../shared/db";

const dbCharacterToEnumMap = new Map<string, GraphQL.ThermostatAction>([
  ["H", GraphQL.ThermostatAction.Heat],
  ["C", GraphQL.ThermostatAction.Cool],
  ["R", GraphQL.ThermostatAction.Circulate],
]);

const enumToDbCharacterMap = new Map<GraphQL.ThermostatAction, string>([
  [GraphQL.ThermostatAction.Heat, "H"],
  [GraphQL.ThermostatAction.Cool, "C"],
  [GraphQL.ThermostatAction.Circulate, "R"],
]);

const throwUndefinedStoredAction = (a: string): GraphQL.ThermostatAction => {
  throw new Error(`Unrecognized action '${a}'`);
};

const throwUndefinedProvidedAction = (a: GraphQL.ThermostatAction): string => {
  throw new Error(`Unrecognized action '${a}'`);
};

class ThermostatConfigurationMapper {
  public static publicFromPrivate(rhs: ThermostatConfiguration): GraphQL.ThermostatConfiguration {
    return {
      tenant: rhs.tenant,
      deviceId: rhs.deviceId,
      name: rhs.name,
      setPointHeat: rhs.setPointHeat,
      setPointCool: rhs.setPointCool,
      threshold: rhs.threshold,
      cadence: rhs.cadence,
      allowedActions: rhs.allowedActions
        .split("")
        .map(c => dbCharacterToEnumMap.get(c) || throwUndefinedStoredAction(c)),
    };
  }

  public static privateFromPublic(
    lhs: ThermostatConfiguration,
    rhs: GraphQL.ThermostatConfigurationCreateInput
  ) {
    lhs.name = rhs.name;
    lhs.setPointHeat = rhs.setPointHeat;
    lhs.setPointCool = rhs.setPointCool;
    lhs.threshold = rhs.threshold;
    lhs.cadence = rhs.cadence;
    lhs.allowedActions = rhs.allowedActions
      .map(a => enumToDbCharacterMap.get(a) || throwUndefinedProvidedAction(a))
      .join("");
  }

  public static privateFromPublicUpdate(
    lhs: ThermostatConfiguration,
    rhs: GraphQL.ThermostatConfigurationUpdateInput
  ) {
    lhs.name = rhs.name || lhs.name;
    lhs.setPointHeat = rhs.setPointHeat || lhs.setPointHeat;
    lhs.setPointCool = rhs.setPointCool || lhs.setPointCool;
    lhs.threshold = rhs.threshold || lhs.threshold;
    lhs.cadence = rhs.cadence || lhs.cadence;
    lhs.allowedActions = rhs.allowedActions
      ? rhs.allowedActions
          .map(a => enumToDbCharacterMap.get(a) || throwUndefinedProvidedAction(a))
          .join("")
      : lhs.allowedActions;
  }
}

export default ThermostatConfigurationMapper;
