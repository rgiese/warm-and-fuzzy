import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("ThermostatConfiguration")
export default class ThermostatConfiguration {
  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant = "";

  // Device ID (assigned by Particle)
  @rangeKey()
  public id = "";

  // User-facing name
  @attribute()
  public name = "";

  // Stream (historical data) name
  @attribute()
  public streamName = "";

  // Target temperature for heating [Celsius]
  @attribute()
  public setPointHeat = NaN;

  // Target temperature for cooling [Celsius]
  @attribute()
  public setPointCool = NaN;

  // External sensor ID (if provided, prefer this over onboard sensor) [OneWire 64-bit hex ID]
  @attribute()
  public externalSensorId?: string = undefined;

  // Hysteresis threshold around targets [Celsius]
  @attribute()
  public threshold = NaN;

  // Operational cadence [sec]
  @attribute()
  public cadence = NaN;

  // Allowed actions: GraphQL.ThermostatAction (may be `undefined` if no actions are allowed)
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction> = undefined;

  // Available actions: GraphQL.ThermostatAction (may be `undefined` if no actions are available)
  @attribute({ memberType: "String" })
  public availableActions?: Set<GraphQL.ThermostatAction> = undefined;
}
