import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

// See https://github.com/awslabs/dynamodb-data-mapper-js

@table("LatestActions")
export default class LatestAction {
  public constructor() {
    this.tenant = "";
    this.deviceId = "";

    this.publishedTime = new Date();
    this.deviceTime = new Date();
    this.deviceLocalSerial = 0;
    this.currentActions = undefined;
  }

  /**
   * @name LatestAction#tenant
   *
   * Tenant (assigned by WarmAndFuzzy)
   */
  @hashKey()
  public tenant: string;

  /**
   * @name LatestAction#deviceId
   *
   * Device ID (assigned by Particle)
   */
  @rangeKey()
  public deviceId: string;

  /**
   * @name LatestAction#publishedTime
   *
   * Timestamp attached by Particle OS when event was published
   */
  @attribute()
  public publishedTime: Date;

  /**
   * @name LatestAction#deviceTime
   *
   * Timestamp attached by firmware when event was created
   */
  @attribute()
  public deviceTime: Date;

  /**
   * @name LatestAction#deviceLocalSerial
   *
   * Serial number (scoped to power cycle) attached by firmware when event was created
   */
  @attribute()
  public deviceLocalSerial: number;

  /**
   * @name LatestAction#currentActions
   *
   * c.f. ThermostatConfiguration#allowedActions
   */
  @attribute({ memberType: "String" })
  public currentActions?: Set<GraphQL.ThermostatAction>;
}
