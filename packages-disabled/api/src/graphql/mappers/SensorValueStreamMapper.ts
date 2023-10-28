import * as GraphQL from "../../../generated/graphqlTypes";

import GraphQLModelMapper from "./GraphQLModelMapper";
import { SensorValueStream } from "../../shared/db";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - rename "ts" to "deviceTime" and instantiate as a Date
//

class SensorValueStreamMapper
  implements
    GraphQLModelMapper<GraphQL.SensorValueStream, GraphQL.SensorValueStream, SensorValueStream> {
  private readonly streamName: string;

  public constructor(streamName: string) {
    this.streamName = streamName;
  }

  public graphqlFromModel(rhs: SensorValueStream): GraphQL.SensorValueStream {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { ts, stream, ...remainder } = rhs;

    return {
      ...remainder,
      streamName: this.streamName, // use provided `streamName` instead of encoded/fetched `stream`
      deviceTime: new Date(ts),
    };
  }

  public modelFromGraphql(_tenant: string, _rhs: GraphQL.SensorValueStream): SensorValueStream {
    throw new Error("Not supported");
  }
}

export default SensorValueStreamMapper;
