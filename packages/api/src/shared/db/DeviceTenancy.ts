import { hashKey, attribute, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("DeviceTenancy")
export default class DeviceTenancy {
  // Device ID (assigned by Particle)
  @hashKey()
  public id = "";

  // Tenant (assigned by WarmAndFuzzy)
  @attribute()
  public tenant = "";
}
