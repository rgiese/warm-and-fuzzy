import { attribute, table } from "@aws/dynamodb-data-mapper-annotations";

import DeviceWithTenantAndId from "./DeviceWithTenantAndId";
import ThermostatSetting from "./ThermostatSetting";
import { embed } from "@aws/dynamodb-data-mapper";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

@table("ThermostatSettings")
export default class ThermostatSettings extends DeviceWithTenantAndId {
  @attribute({ memberType: embed(ThermostatSetting) })
  public settings?: ThermostatSetting[];

  public constructor() {
    super();

    this.settings = new Array<ThermostatSetting>();
  }
}
