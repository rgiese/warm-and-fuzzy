import { hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("DeviceTenancy")
export default class ThermostatConfiguration {
  public constructor() {
    this.deviceId = "";
    this.tenant = "";
  }

  /**
   * @name ThermostatConfiguration#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @hashKey()
  public deviceId: string;

  /**
   * @name ThermostatConfiguration#deviceId
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @rangeKey()
  public tenant: string;
}
