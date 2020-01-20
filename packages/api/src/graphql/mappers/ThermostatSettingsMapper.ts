import * as GraphQL from "../../../generated/graphqlTypes";
import { ThermostatSettings } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";
import ThermostatSettingMapper from "./ThermostatSettingMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - settings is a non-nullable array in GraphQL but a nullable Array in DynamoDB
//   and needs to be set to `undefined` for empty arrays
// - settings is a nested type and requires mapping with ThermostatSettingMapper
//

class ThermostatSettingsMapper
  implements
    GraphQLModelMapper<
      GraphQL.ThermostatSettings,
      GraphQL.ThermostatSettingsCreateInput,
      ThermostatSettings
    > {
  public graphqlFromModel(rhs: ThermostatSettings): GraphQL.ThermostatSettings {
    const { settings, ...remainder } = rhs;

    return {
      ...remainder,
      settings: settings
        ? Array.from(
            settings.map(setting => this.thermostatSettingMapper.graphqlFromModel(setting))
          )
        : [],
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatSettingsCreateInput
  ): ThermostatSettings {
    const { settings, ...remainder } = rhs;

    return Object.assign(new ThermostatSettings(), {
      tenant,
      ...remainder,
      settings:
        settings.length > 0
          ? settings.map(setting => this.thermostatSettingMapper.modelFromGraphql(tenant, setting))
          : undefined,
    });
  }

  thermostatSettingMapper = new ThermostatSettingMapper();
}

export default ThermostatSettingsMapper;
