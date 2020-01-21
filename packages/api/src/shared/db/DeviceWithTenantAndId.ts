import { hashKey, rangeKey } from "@aws/dynamodb-data-mapper-annotations";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

export default class DeviceWithTenantAndId {
  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant: string;

  // Device ID (assigned by Particle)
  @rangeKey()
  public id: string;

  public constructor() {
    this.tenant = "";
    this.id = "";
  }
}
