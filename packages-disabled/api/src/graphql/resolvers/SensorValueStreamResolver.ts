import * as GraphQL from "../../../generated/graphqlTypes";

import { DbMapper, SensorValueStream } from "../../shared/db";

import SensorValueStreamMapper from "../mappers/SensorValueStreamMapper";
import { between } from "@aws/dynamodb-expressions";

class SensorValueStreamResolver {
  public async getAllWithCondition(
    tenant: string,
    args: GraphQL.QueryGetSensorValueStreamsArgs
  ): Promise<GraphQL.SensorValueStream[]> {
    const sensorValueStreamMapper = new SensorValueStreamMapper(args.streamName);
    const items = new Array<GraphQL.SensorValueStream>();

    const fromDate = args.fromDate ?? new Date(0 /* beginning of time */);
    const toDate = args.toDate ?? new Date(/* now */);

    for await (const modelItem of DbMapper.query(SensorValueStream, {
      stream: SensorValueStream.getStreamKey(tenant, args.streamName),
      ts: between(fromDate.getTime(), toDate.getTime()),
    })) {
      items.push(sensorValueStreamMapper.graphqlFromModel(modelItem));
    }

    return items;
  }
}

const sensorValueStreamResolver = new SensorValueStreamResolver();

export default sensorValueStreamResolver;
