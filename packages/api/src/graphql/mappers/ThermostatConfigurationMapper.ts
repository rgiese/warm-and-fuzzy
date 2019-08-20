import * as GraphQL from "../../../generated/graphqlTypes";
import { ThermostatConfiguration } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - allowedActions is a non-nullable array in GraphQL but a nullable Set in DynamoDB
//   and needs to be set to `undefined` for empty sets
//

class ThermostatConfigurationMapper
  implements
    GraphQLModelMapper<
      GraphQL.ThermostatConfiguration,
      GraphQL.ThermostatConfigurationCreateInput,
      ThermostatConfiguration
    > {
  public graphqlFromModel(rhs: ThermostatConfiguration): GraphQL.ThermostatConfiguration {
    const { availableActions, allowedActions, ...remainder } = rhs;

    return {
      ...remainder,
      availableActions: availableActions ? Array.from(availableActions) : [],
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatConfigurationCreateInput
  ): ThermostatConfiguration {
    const { availableActions, allowedActions, ...remainder } = rhs;

    return Object.assign(new ThermostatConfiguration(), {
      tenant,
      ...remainder,
      availableActions: availableActions.length > 0 ? new Set(availableActions) : undefined,
      allowedActions: allowedActions.length > 0 ? new Set(allowedActions) : undefined,
    });
  }
}

export default ThermostatConfigurationMapper;
