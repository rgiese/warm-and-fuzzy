import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("LatestThermostatValues")
export default class ThermostatValue {
  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant = "";

  // Device ID (assigned by Particle)
  @rangeKey()
  public id = "";

  // Timestamp attached by Particle OS when event was published
  @attribute()
  public publishedTime: Date = new Date();

  // Timestamp attached by firmware when event was created
  @attribute()
  public deviceTime: Date = new Date();

  // Serial number (scoped to power cycle) attached by firmware when event was created
  @attribute()
  public deviceLocalSerial = 0;

  // @see ThermostatConfiguration#allowedActions
  @attribute({ memberType: "String" })
  public currentActions?: Set<GraphQL.ThermostatAction> = undefined;

  // Units: Celsius
  @attribute()
  public temperature = 0.0;

  // Units: %RH [0-100]
  @attribute()
  public humidity = 0.0;

  // Target temperature for heating [Celsius]
  @attribute()
  public setPointHeat = NaN;

  // Target temperature for cooling [Celsius]
  @attribute()
  public setPointCool = NaN;

  // Hysteresis threshold around targets [Celsius]
  @attribute()
  public threshold = NaN;

  // @see ThermostatConfiguration#allowedActions
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction> = undefined;
}
