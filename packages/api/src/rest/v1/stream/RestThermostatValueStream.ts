import * as GraphQL from "../../../../generated/graphqlTypes";

export default class RestThermostatValueStream {
  public constructor() {
    this.stream = "";
    this.ts = 0;

    this.publishedTime = new Date();
    this.deviceLocalSerial = 0;
    this.currentActions = [];
    this.temperature = 0.0;
    this.humidity = 0.0;
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.allowedActions = [];
  }

  // Stream name (assigned by WarmAndFuzzy)
  public stream: string;

  // Timestamp attached by firmware when event was created
  public ts: Date;

  // Timestamp attached by Particle OS when event was published
  public publishedTime: Date;

  // Serial number (scoped to power cycle) attached by firmware when event was created
  public deviceLocalSerial: number;

  // @see ThermostatConfiguration#allowedActions
  public currentActions: GraphQL.ThermostatAction[];

  // Units: Celsius
  public temperature: number;

  // Units: %RH [0-100]
  public humidity: number;

  // Target temperature for heating [Celsius]
  public setPointHeat: number;

  // Target temperature for cooling [Celsius]
  public setPointCool: number;

  // Hysteresis threshold around targets [Celsius]
  public threshold: number;

  // @see ThermostatConfiguration#allowedActions
  public allowedActions: GraphQL.ThermostatAction[];
}
