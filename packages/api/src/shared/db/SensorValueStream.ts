import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import SensorConfiguration from "./SensorConfiguration";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("ValueStreams")
export default class SensorValueStream {
  public constructor() {
    this.stream = "";
    this.ts = 0;

    this.publishedTime = new Date();
    this.deviceLocalSerial = 0;
    this.temperature = 0.0;
  }

  public static getStreamName(tenant: string, sensorConfiguration: SensorConfiguration): string {
    return `${tenant}#S#${sensorConfiguration.streamName}`;
  }

  // Stream name (assigned by WarmAndFuzzy)
  @hashKey()
  public stream: string;

  // Timestamp attached by firmware when event was created
  @rangeKey()
  public ts: number;

  // Timestamp attached by Particle OS when event was published
  @attribute()
  public publishedTime: Date;

  // Serial number (scoped to power cycle) attached by firmware when event was created
  @attribute()
  public deviceLocalSerial: number;

  // Units: Celsius
  @attribute()
  public temperature: number;
}
