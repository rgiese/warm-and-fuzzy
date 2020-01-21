import * as GraphQL from "../../../generated/graphqlTypes";

import GraphQLModelMapper from "./GraphQLModelMapper";
import { ThermostatConfiguration } from "../../shared/db";

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
    const { availableActions, ...remainder } = rhs;

    return {
      ...remainder,
      availableActions: availableActions ? Array.from(availableActions) : [],
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatConfigurationCreateInput
  ): ThermostatConfiguration {
    const { availableActions, ...remainder } = rhs;

    return Object.assign(new ThermostatConfiguration(), {
      tenant,
      ...remainder,
      availableActions: availableActions.length > 0 ? new Set(availableActions) : undefined,
    });
  }
}

export default ThermostatConfigurationMapper;
