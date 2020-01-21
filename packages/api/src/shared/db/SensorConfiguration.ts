import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";

import DeviceWithTenantAndId from "./DeviceWithTenantAndId";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

@table("SensorConfiguration")
export default class SensorConfiguration extends DeviceWithTenantAndId {
  // User-facing name
  @attribute()
  public name: string;

  // Stream (historical data) name
  @attribute()
  public streamName: string;

  public constructor() {
    super();

    this.name = "";
    this.streamName = "";
  }
}
