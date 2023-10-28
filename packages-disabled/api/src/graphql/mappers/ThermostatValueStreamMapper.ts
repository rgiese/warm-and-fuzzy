import * as GraphQL from "../../../generated/graphqlTypes";

import GraphQLModelMapper from "./GraphQLModelMapper";
import { ThermostatValueStream } from "../../shared/db";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - currentActions is a non-nullable array in GraphQL but a nullable Set in DynamoDB
//   and needs to be set to `undefined` for empty sets
//

class LatestThermostatValueMapper
  implements
    GraphQLModelMapper<
      GraphQL.ThermostatValueStream,
      GraphQL.ThermostatValueStream,
      ThermostatValueStream
    > {
  private readonly streamName: string;

  public constructor(streamName: string) {
    this.streamName = streamName;
  }

  public graphqlFromModel(rhs: ThermostatValueStream): GraphQL.ThermostatValueStream {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { ts, stream, currentActions, allowedActions, ...remainder } = rhs;

    return {
      ...remainder,
      streamName: this.streamName, // use provided `streamName` instead of encoded/fetched `stream`
      deviceTime: new Date(ts),
      currentActions: currentActions ? Array.from(currentActions) : [],
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    };
  }

  public modelFromGraphql(
    _tenant: string,
    _rhs: GraphQL.ThermostatValueStream
  ): ThermostatValueStream {
    throw new Error("Not supported");
  }
}

export default LatestThermostatValueMapper;
