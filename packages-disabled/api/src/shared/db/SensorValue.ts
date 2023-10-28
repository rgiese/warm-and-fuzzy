import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";

import DeviceWithTenantAndId from "./DeviceWithTenantAndId";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

@table("LatestSensorValues")
export default class SensorValue extends DeviceWithTenantAndId {
  // Timestamp attached by Particle OS when event was published
  @attribute()
  public publishedTime: Date;

  // Timestamp attached by firmware when event was created
  @attribute()
  public deviceTime: Date;

  // Serial number (scoped to power cycle) attached by firmware when event was created
  @attribute()
  public deviceLocalSerial: number;

  // Units: Celsius
  @attribute()
  public temperature: number;

  public constructor() {
    super();

    this.publishedTime = new Date();
    this.deviceTime = new Date();
    this.deviceLocalSerial = 0;
    this.temperature = 0.0;
  }
}
