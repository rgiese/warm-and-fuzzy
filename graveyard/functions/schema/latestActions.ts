import { DataType, IsPartitionKey, IsRowKey, IsType } from "../common/azureTableStorage";

export class LatestActions {
  /**
   * @name LatestActions#tenant
   */
  @IsPartitionKey
  public tenant: string;

  /**
   * @name LatestActions#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @IsRowKey
  public deviceId: string;

  /**
   * @name LatestActions#publishedTime
   *
   * Timestamp attached by Particle OS when event was published
   */
  public publishedTime: Date;

  /**
   * @name LatestActions#deviceTime
   *
   * Timestamp attached by firmware when event was created
   */
  public deviceTime: Date;

  /**
   * @name LatestActions#deviceLocalSerial
   *
   * Serial number (scoped to power cycle) attached by firmware when event was created
   */
  @IsType(DataType.Int32)
  public deviceLocalSerial: number;

  /**
   * @name LatestActions#currentActions
   *
   * c.f. DeviceConfiguration#allowedActions
   * e.g. "CR"
   */
  public currentActions: string;

  public constructor() {
    this.tenant = "";
    this.deviceId = "";
    this.publishedTime = new Date();
    this.deviceTime = new Date();
    this.deviceLocalSerial = 0;
    this.currentActions = "";
  }
}
