import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

@table("ThermostatConfiguration")
export default class ThermostatConfiguration {
  public constructor() {
    this.tenant = "";
    this.id = "";

    this.name = "";
    this.streamName = "";
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.externalSensorId = undefined;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedActions = undefined;
    this.availableActions = undefined;
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

  // Stream (historical data) name
  @attribute()
  public streamName: string;

  // Target temperature for heating [Celsius]
  @attribute()
  public setPointHeat: number;

  // Target temperature for cooling [Celsius]
  @attribute()
  public setPointCool: number;

  // External sensor ID (if provided, prefer this over onboard sensor) [OneWire 64-bit hex ID]
  @attribute()
  public externalSensorId?: string;

  // Hysteresis threshold around targets [Celsius]
  @attribute()
  public threshold: number;

  // Operational cadence [sec]
  @attribute()
  public cadence: number;

  // Allowed actions: GraphQL.ThermostatAction (may be `undefined` if no actions are allowed)
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction>;

  // Available actions: GraphQL.ThermostatAction (may be `undefined` if no actions are available)
  @attribute({ memberType: "String" })
  public availableActions?: Set<GraphQL.ThermostatAction>;
}
