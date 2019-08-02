import * as GraphQL from "../../../generated/graphqlTypes";
import { SensorConfiguration } from "../../shared/db";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - no current adjustments
//

class SensorConfigurationMapper {
  public static graphqlFromModel(rhs: SensorConfiguration): GraphQL.SensorConfiguration {
    const { ...remainder } = rhs;

    return {
      ...remainder,
    };
  }

  public static modelFromGraphql(
    tenant: string,
    rhs: GraphQL.SensorConfigurationCreateInput
  ): SensorConfiguration {
    const { ...remainder } = rhs;

    return Object.assign(new SensorConfiguration(), {
      tenant,
      ...remainder,
    });
  }
}

export default SensorConfigurationMapper;
