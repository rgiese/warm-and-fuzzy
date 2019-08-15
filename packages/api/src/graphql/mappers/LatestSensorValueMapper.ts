import * as GraphQL from "../../../generated/graphqlTypes";
import { SensorValue } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - no current adjustments
//

class LatestSensorValueMapper
  implements GraphQLModelMapper<GraphQL.SensorValue, GraphQL.SensorValue, SensorValue> {
  public graphqlFromModel(rhs: SensorValue): GraphQL.SensorValue {
    const { ...remainder } = rhs;

    return {
      ...remainder,
    };
  }

  public modelFromGraphql(_tenant: string, _rhs: GraphQL.SensorValue): SensorValue {
    throw new Error("Not supported");
  }
}

export default LatestSensorValueMapper;
