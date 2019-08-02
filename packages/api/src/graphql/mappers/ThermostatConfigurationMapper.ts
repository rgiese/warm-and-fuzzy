import * as GraphQL from "../../../generated/graphqlTypes";
import { ThermostatConfiguration } from "../../shared/db";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - allowedActions is a non-nullable array in GraphQL but a nullable Set in DynamoDB
//   and needs to be set to `undefined` for empty sets
//

class ThermostatConfigurationMapper {
  public static graphqlFromModel(rhs: ThermostatConfiguration): GraphQL.ThermostatConfiguration {
    const { allowedActions, ...remainder } = rhs;

    return {
      ...remainder,
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    };
  }

  public static modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatConfigurationCreateInput
  ): ThermostatConfiguration {
    const { allowedActions, ...remainder } = rhs;

    return Object.assign(new ThermostatConfiguration(), {
      tenant,
      ...remainder,
      allowedActions: allowedActions.length > 0 ? new Set(allowedActions) : undefined,
    });
  }
}

export default ThermostatConfigurationMapper;
