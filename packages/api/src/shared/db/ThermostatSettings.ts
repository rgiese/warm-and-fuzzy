import { embed } from "@aws/dynamodb-data-mapper";
import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

import DeviceWithTenantAndId from "./DeviceWithTenantAndId";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

export class ThermostatSetting {
  public constructor() {
    this.type = GraphQL.ThermostatSettingType.Hold;

    this.holdUntil = undefined;

    this.daysOfWeek = undefined;
    this.atMinutesSinceMidnight = undefined;

    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.allowedActions = undefined;
  }

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

  // Allowed actions: GraphQL.ThermostatAction (may be `undefined` if no actions are allowed)
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction>;
}

@table("ThermostatSettings")
export default class ThermostatSettings extends DeviceWithTenantAndId {
  public constructor() {
    super();

    this.settings = new Array<ThermostatSetting>();
  }

  @attribute({ memberType: embed(ThermostatSetting) })
  public settings?: Array<ThermostatSetting>;
}
