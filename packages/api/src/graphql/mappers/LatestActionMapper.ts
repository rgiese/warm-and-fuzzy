import * as GraphQL from "../../../generated/graphqlTypes";
import { LatestAction } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - currentActions is a non-nullable array in GraphQL but a nullable Set in DynamoDB
//   and needs to be set to `undefined` for empty sets
//

class LatestActionMapper
  implements GraphQLModelMapper<GraphQL.DeviceAction, GraphQL.DeviceAction, LatestAction> {
  public graphqlFromModel(rhs: LatestAction): GraphQL.DeviceAction {
    const { currentActions, ...remainder } = rhs;

    return {
      ...remainder,
      currentActions: currentActions ? Array.from(currentActions) : [],
    };
  }

  public modelFromGraphql(_tenant: string, _rhs: GraphQL.DeviceAction): LatestAction {
    throw new Error("Not supported");
  }
}

export default LatestActionMapper;
