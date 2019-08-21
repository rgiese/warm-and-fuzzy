import { between } from "@aws/dynamodb-expressions";
import { DbMapper, ThermostatValueStream } from "../../shared/db";

import * as GraphQL from "../../../generated/graphqlTypes";

import ThermostatValueStreamMapper from "../mappers/ThermostatValueStreamMapper";

class ThermostatValueStreamResolver {
  public async getAllWithCondition(
    tenant: string,
    args: GraphQL.QueryGetThermostatValueStreamsArgs
  ): Promise<GraphQL.ThermostatValueStream[]> {
    const thermostatValueStreamMapper = new ThermostatValueStreamMapper(args.streamName);
    const items = new Array<GraphQL.ThermostatValueStream>();

    const fromDate = args.fromDate || new Date(0 /* beginning of time */);
    const toDate = args.toDate || new Date(/* now */);

    for await (const modelItem of DbMapper.query(ThermostatValueStream, {
      stream: ThermostatValueStream.getStreamKey(tenant, args.streamName),
      ts: between(fromDate.getTime(), toDate.getTime()),
    })) {
      items.push(thermostatValueStreamMapper.graphqlFromModel(modelItem));
    }

    return items;
  }
}

const thermostatValueStreamResolver = new ThermostatValueStreamResolver();

export default thermostatValueStreamResolver;
