import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("LatestSensorValues")
export default class SensorValue {
  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant = "";

  // Sensor ID (assigned by Particle/OneWire)
  @rangeKey()
  public id = "";

  // Timestamp attached by Particle OS when event was published
  @attribute()
  public publishedTime: Date = new Date();

  // Timestamp attached by firmware when event was created
  @attribute()
  public deviceTime: Date = new Date();

  // Serial number (scoped to power cycle) attached by firmware when event was created
  @attribute()
  public deviceLocalSerial = 0;

  // Units: Celsius
  @attribute()
  public temperature = 0.0;
}
