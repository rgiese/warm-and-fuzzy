import * as GraphQL from "../../../generated/graphqlTypes";
import { LatestValue } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - no current adjustments
//

class LatestValueMapper
  implements GraphQLModelMapper<GraphQL.SensorValue, GraphQL.SensorValue, LatestValue> {
  public graphqlFromModel(rhs: LatestValue): GraphQL.SensorValue {
    const { ...remainder } = rhs;

    return {
      ...remainder,
    };
  }

  public modelFromGraphql(_tenant: string, _rhs: GraphQL.SensorValue): LatestValue {
    throw new Error("Not supported");
  }
}

export default LatestValueMapper;
