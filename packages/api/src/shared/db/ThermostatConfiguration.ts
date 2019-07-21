import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("ThermostatConfig")
export default class ThermostatConfiguration {
  public constructor() {
    this.tenant = "";
    this.deviceId = "";

    this.name = "";
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedActions = "";
  }

  /**
   * @name ThermostatConfiguration#deviceId
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @hashKey()
  public tenant: string;

  /**
   * @name ThermostatConfiguration#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @rangeKey()
  public deviceId: string;

  /**
   * @name ThermostatConfiguration#name
   *
   * User-facing name
   */
  @attribute()
  public name: string;

  /**
   * @name ThermostatConfiguration#setPointHeat
   *
   * Target temperature for heating
   * Units: Celsius
   */
  @attribute()
  public setPointHeat: number;

  /**
   * @name ThermostatConfiguration#setPointCool
   *
   * Target temperature for cooling
   * Units: Celsius
   */
  @attribute()
  public setPointCool: number;

  /**
   * @name ThermostatConfiguration#threshold
   *
   * Hysteresis threshold around targets
   * Units: Celsius
   */
  @attribute()
  public threshold: number;

  /**
   * @name ThermostatConfiguration#cadence
   *
   * Operational cadence
   * Units: seconds
   */
  @attribute()
  public cadence: number;

  /**
   * @name ThermostatConfiguration#allowedActions
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
  @attribute()
  public allowedActions: string;
}
