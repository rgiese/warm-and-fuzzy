import * as GraphQL from "../../../generated/graphqlTypes";

import { attribute } from "@aws/dynamodb-data-mapper-annotations";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

export default class ThermostatSetting {
  // Setting type (discriminated union)
  @attribute()
  public type: GraphQL.ThermostatSettingType;

  //
  // For Hold settings
  //

  @attribute()
  public holdUntil?: Date;

  //
  // For Scheduled settings
  //

  // Days of week the scheduled setting is applicable to
  @attribute({ memberType: "String" })
  public daysOfWeek?: Set<GraphQL.DayOfWeek>;

  // Time of day the scheduled setting becomes applicable at [minutes since midnight]
  @attribute()
  public atMinutesSinceMidnight?: number;

  //
  // For all types
  //

  // Target temperature for heating [Celsius]
  @attribute()
  public setPointHeat: number;

  // Target temperature for cooling [Celsius]
  @attribute()
  public setPointCool: number;

  // Target temperature for circulation (above) [Celsius]
  // TEMPORARY: Optional for backwards compatibility
  @attribute()
  public setPointCirculateAbove?: number;

  // Target temperature for circulation (above) [Celsius]
  // TEMPORARY: Optional for backwards compatibility
  @attribute()
  public setPointCirculateBelow?: number;

  // Allowed actions: GraphQL.ThermostatAction (may be `undefined` if no actions are allowed)
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction>;

  public constructor() {
    this.type = GraphQL.ThermostatSettingType.Hold;

    this.holdUntil = undefined;

    this.daysOfWeek = undefined;
    this.atMinutesSinceMidnight = undefined;

    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.setPointCirculateAbove = NaN;
    this.setPointCirculateBelow = NaN;
    this.allowedActions = undefined;
  }
}
