import * as GraphQL from "../../../generated/graphqlTypes";
import { SensorValueStream } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - rename "ts" to "deviceTime" and instantiate as a Date
//

class SensorValueStreamMapper
  implements
    GraphQLModelMapper<GraphQL.SensorValueStream, GraphQL.SensorValueStream, SensorValueStream> {
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

  private streamName: string;
}

export default SensorValueStreamMapper;
