import * as GraphQL from "../../../generated/graphqlTypes";

import GraphQLModelMapper from "./GraphQLModelMapper";
import { ThermostatSetting } from "../../shared/db";

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
    const { daysOfWeek, allowedActions, ...remainder } = rhs;

    return {
      ...remainder,
      daysOfWeek: daysOfWeek ? Array.from(daysOfWeek) : [],
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatSettingCreateInput
  ): ThermostatSetting {
    const { atMinutesSinceMidnight, daysOfWeek, allowedActions, ...remainder } = rhs;

    return Object.assign(new ThermostatSetting(), {
      tenant,
      ...remainder,
      atMinutesSinceMidnight: atMinutesSinceMidnight ?? undefined,
      daysOfWeek: daysOfWeek?.length ? new Set(daysOfWeek) : undefined,
      allowedActions: allowedActions.length > 0 ? new Set(allowedActions) : undefined,
    });
  }
}

export default ThermostatSettingMapper;
