import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("ValueStreams")
export default class SensorValueStream {
  public static getStreamKey(tenant: string, streamName: string): string {
    return `${tenant}#S#${streamName}`;
  }

  // Stream name (assigned by WarmAndFuzzy)
  @hashKey()
  public stream = "";

  // Timestamp attached by firmware when event was created
  @rangeKey()
  public ts = 0;

  // Timestamp attached by Particle OS when event was published
  @attribute()
  public publishedTime: Date = new Date();

  // Serial number (scoped to power cycle) attached by firmware when event was created
  @attribute()
  public deviceLocalSerial = 0;

  // Units: Celsius
  @attribute()
  public temperature = 0.0;
}
