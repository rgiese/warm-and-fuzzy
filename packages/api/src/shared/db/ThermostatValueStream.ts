import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

@table("ValueStreams")
export default class ThermostatValueStream {
  public constructor() {
    this.stream = "";
    this.ts = 0;

    this.publishedTime = new Date();
    this.deviceLocalSerial = 0;
    this.currentActions = undefined;
    this.temperature = 0.0;
    this.humidity = 0.0;
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.allowedActions = undefined;
  }

  public static getStreamKey(tenant: string, streamName: string): string {
    return `${tenant}#T#${streamName}`;
  }

  // Stream name (assigned by WarmAndFuzzy)
  @hashKey()
  public stream: string;

  // Timestamp attached by firmware when event was created
  @rangeKey()
  public ts: number;

  // Timestamp attached by Particle OS when event was published
  @attribute()
  public publishedTime: Date;

  // Serial number (scoped to power cycle) attached by firmware when event was created
  @attribute()
  public deviceLocalSerial: number;

  // @see ThermostatConfiguration#allowedActions
  @attribute({ memberType: "String" })
  public currentActions?: Set<GraphQL.ThermostatAction>;

  // Units: Celsius
  @attribute()
  public temperature: number;

  // Units: %RH [0-100]
  @attribute()
  public humidity: number;

  // Target temperature for heating [Celsius]
  @attribute()
  public setPointHeat: number;

  // Target temperature for cooling [Celsius]
  @attribute()
  public setPointCool: number;

  // Hysteresis threshold around targets [Celsius]
  @attribute()
  public threshold: number;

  // @see ThermostatConfiguration#allowedActions
  @attribute({ memberType: "String" })
  public allowedActions?: Set<GraphQL.ThermostatAction>;
}
