import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("LatestValues")
export default class LatestValue {
  public constructor() {
    this.tenant = "";
    this.sensorId = "";

    this.publishedTime = new Date();
    this.deviceTime = new Date();
    this.deviceLocalSerial = 0;
    this.temperature = 0.0;
    this.humidity = 0.0;
  }

  /**
   * @name LatestValue#tenant
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @hashKey()
  public tenant: string;

  /**
   * @name LatestValue#sensorId
   *
   * Sensor ID (assigned by Particle/OneWire)
   */
  @rangeKey()
  public sensorId: string;

  /**
   * @name LatestValue#publishedTime
   *
   * Timestamp attached by Particle OS when event was published
   */
  @attribute()
  public publishedTime: Date;

  /**
   * @name LatestValue#deviceTime
   *
   * Timestamp attached by firmware when event was created
   */
  @attribute()
  public deviceTime: Date;

  /**
   * @name LatestValue#deviceLocalSerial
   *
   * Serial number (scoped to power cycle) attached by firmware when event was created
   */
  @attribute()
  public deviceLocalSerial: number;

  /**
   * @name LatestValue#temperature
   *
   * Units: Celsius
   */
  @attribute()
  public temperature: number;

  /**
   * @name LatestValue#humidity
   *
   * Units: %RH [0-100]
   */
  @attribute()
  public humidity: number;
}
