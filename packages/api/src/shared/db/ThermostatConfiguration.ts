import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

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
    this.allowedActions = undefined;
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
   * Allowed actions: GraphQL.ThermostatAction
   *
   * - heating
   * - cooling
   * - circulation
   *
   * May be `undefined` if no actions are permitted.
   */
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction>;
}
