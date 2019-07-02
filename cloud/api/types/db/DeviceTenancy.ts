import { hashKey, attribute, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("DeviceTenancy")
export default class DeviceTenancy {
  public constructor() {
    this.deviceId = "";
    this.tenant = "";
  }

  /**
   * @name DeviceTenancy#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @hashKey()
  public deviceId: string;

  /**
   * @name DeviceTenancy#tenant
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @attribute()
  public tenant: string;
}
