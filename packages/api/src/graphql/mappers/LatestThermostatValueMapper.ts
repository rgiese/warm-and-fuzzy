import * as GraphQL from "../../../generated/graphqlTypes";
import { ThermostatValue } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - currentActions is a non-nullable array in GraphQL but a nullable Set in DynamoDB
//   and needs to be set to `undefined` for empty sets
//

class LatestThermostatValueMapper
  implements GraphQLModelMapper<GraphQL.ThermostatValue, GraphQL.ThermostatValue, ThermostatValue> {
  public graphqlFromModel(rhs: ThermostatValue): GraphQL.ThermostatValue {
    const { currentActions, allowedActions, ...remainder } = rhs;

    return {
      ...remainder,
      currentActions: currentActions ? Array.from(currentActions) : [],
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    };
  }

  public modelFromGraphql(_tenant: string, _rhs: GraphQL.ThermostatValue): ThermostatValue {
    throw new Error("Not supported");
  }
}

export default LatestThermostatValueMapper;
