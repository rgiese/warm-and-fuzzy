import { embed } from "@aws/dynamodb-data-mapper";
import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

import * as GraphQL from "../../../generated/graphqlTypes";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

export class ThermostatSetting {
  public constructor() {
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.allowedActions = undefined;
  }

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
export default class ThermostatSettings {
  public constructor() {
    this.tenant = "";
    this.id = "";
    this.settings = new Array<ThermostatSetting>();
  }

  // Tenant (assigned by WarmAndFuzzy)
  @hashKey()
  public tenant: string;

  // Device ID (assigned by Particle)
  @rangeKey()
  public id: string;

  @attribute({ memberType: embed(ThermostatSetting) })
  public settings?: Array<ThermostatSetting>;
}
