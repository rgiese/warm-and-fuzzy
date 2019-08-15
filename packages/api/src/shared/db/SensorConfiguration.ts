import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("SensorConfiguration")
export default class SensorConfiguration {
  public constructor() {
    this.tenant = "";
    this.id = "";

    this.name = "";
  }

  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant: string;

  // Device ID (assigned by Particle or OneWire/DalSemi)
  @rangeKey()
  public id: string;

  // User-facing name
  @attribute()
  public name: string;
}
