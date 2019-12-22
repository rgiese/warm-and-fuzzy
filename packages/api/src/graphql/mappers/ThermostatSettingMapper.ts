import * as GraphQL from "../../../generated/graphqlTypes";
import { ThermostatSetting } from "../../shared/db";

import GraphQLModelMapper from "./GraphQLModelMapper";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - allowedActions is a non-nullable array in GraphQL but a nullable Set in DynamoDB
//   and needs to be set to `undefined` for empty sets
//

class ThermostatSettingMapper
  implements
    GraphQLModelMapper<
      GraphQL.ThermostatSetting,
      GraphQL.ThermostatSettingCreateInput,
      ThermostatSetting
    > {
  public graphqlFromModel(rhs: ThermostatSetting): GraphQL.ThermostatSetting {
    const { allowedActions, ...remainder } = rhs;

    return {
      ...remainder,
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatSettingCreateInput
  ): ThermostatSetting {
    const { allowedActions, ...remainder } = rhs;

    return Object.assign(new ThermostatSetting(), {
      tenant,
      ...remainder,
      allowedActions: allowedActions.length > 0 ? new Set(allowedActions) : undefined,
    });
  }
}

export default ThermostatSettingMapper;
