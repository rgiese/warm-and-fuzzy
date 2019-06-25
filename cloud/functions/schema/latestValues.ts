import { DataType, IsPartitionKey, IsRowKey, IsType } from "../common/azureTableStorage";

export class LatestValues {
  /**
   * @name LatestValues#tenant
   */
  @IsPartitionKey
  public tenant: string;

  /**
   * @name LatestValues#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @IsRowKey
  public deviceId: string;

  /**
   * @name LatestValues#publishedTime
   *
   * Timestamp attached by Particle OS when event was published
   */
  public publishedTime: Date;

  /**
   * @name LatestValues#deviceTime
   *
   * Timestamp attached by firmware when event was created
   */
  public deviceTime: Date;

  /**
   * @name LatestValues#deviceLocalSerial
   *
   * Serial number (scoped to power cycle) attached by firmware when event was created
   */
  @IsType(DataType.Int32)
  public deviceLocalSerial: number;

  /**
   * @name LatestValues#temperature
   *
   * Units: Celsius
   */
  @IsType(DataType.Double)
  public temperature: number;

  /**
   * @name LatestValues#humidity
   *
   * Units: %RH [0-100]
   */
  @IsType(DataType.Double)
  public humidity: number;

  public constructor() {
    this.tenant = "";
    this.deviceId = "";
    this.publishedTime = new Date();
    this.deviceTime = new Date();
    this.deviceLocalSerial = 0;
    this.temperature = 0.0;
    this.humidity = 0.0;
  }
}
