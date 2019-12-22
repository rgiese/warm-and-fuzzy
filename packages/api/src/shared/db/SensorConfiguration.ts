import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("SensorConfiguration")
export default class SensorConfiguration {
  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant = "";

  // Device ID (assigned by Particle or OneWire/DalSemi)
  @rangeKey()
  public id = "";

  // User-facing name
  @attribute()
  public name = "";

  // Stream (historical data) name
  @attribute()
  public streamName = "";
}
