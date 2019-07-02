import { DataType, IsRowKey, IsType } from "../common/azureTableStorage";

export class DeviceConfiguration {
  /**
   * @name DeviceConfiguration#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @IsRowKey
  public deviceId: string;

  /**
   * @name DeviceConfiguration#setPointHeat
   *
   * Target temperature for heating
   * Units: Celsius
   */
  @IsType(DataType.Double)
  public setPointHeat: number;

  /**
   * @name DeviceConfiguration#setPointCool
   *
   * Target temperature for cooling
   * Units: Celsius
   */
  @IsType(DataType.Double)
  public setPointCool: number;

  /**
   * @name DeviceConfiguration#threshold
   *
   * Hysteresis threshold around targets
   * Units: Celsius
   */
  @IsType(DataType.Double)
  public threshold: number;

  /**
   * @name DeviceConfiguration#cadence
   *
   * Operational cadence
   * Units: seconds
   */
  @IsType(DataType.Int32)
  public cadence: number;

  /**
   * @name DeviceConfiguration#allowedActions
   *
   * Allowed actions:
   * - heating ("H")
   * - cooling ("C")
   * - circulation ("R")
   *
   * For example: "HCR"
   *
   * May be left empty if no actions are permitted.
   */
  public allowedActions: string;

  public constructor() {
    this.deviceId = "";
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedActions = "";
  }
}
