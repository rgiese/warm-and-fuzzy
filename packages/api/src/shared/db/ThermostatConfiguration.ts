import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("ThermostatConfiguration")
export default class ThermostatConfiguration {
  public constructor() {
    this.tenant = "";
    this.id = "";

    this.name = "";
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedActions = undefined;
  }

  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant: string;

  // Device ID (assigned by Particle)
  @rangeKey()
  public id: string;

  // User-facing name
  @attribute()
  public name: string;

  // Target temperature for heating [Celsius]
  @attribute()
  public setPointHeat: number;

  // Target temperature for cooling [Celsius]
  @attribute()
  public setPointCool: number;

  // Hysteresis threshold around targets [Celsius]
  @attribute()
  public threshold: number;

  // Operational cadence [sec]
  @attribute()
  public cadence: number;

  // Allowed actions: GraphQL.ThermostatAction (may be `undefined` if no actions are permitted)
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction>;
}
