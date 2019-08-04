import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("SensorConfig")
export default class SensorConfiguration {
  public constructor() {
    this.tenant = "";
    this.sensorId = "";

    this.name = "";
  }

  /**
   * @name SensorConfiguration#deviceId
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @hashKey()
  public tenant: string;

  /**
   * @name SensorConfiguration#sensorId
   *
   * Device ID (assigned by Particle or OneWire/DalSemi)
   */
  @rangeKey()
  public sensorId: string;

  /**
   * @name SensorConfiguration#name
   *
   * User-facing name
   */
  @attribute()
  public name: string;
}
