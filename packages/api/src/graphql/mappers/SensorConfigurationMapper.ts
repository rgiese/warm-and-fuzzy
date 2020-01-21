import * as GraphQL from "../../../generated/graphqlTypes";

import GraphQLModelMapper from "./GraphQLModelMapper";
import { SensorConfiguration } from "../../shared/db";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - no current adjustments
//

class SensorConfigurationMapper
  implements
    GraphQLModelMapper<
      GraphQL.SensorConfiguration,
      GraphQL.SensorConfigurationCreateInput,
      SensorConfiguration
    > {
  public graphqlFromModel(rhs: SensorConfiguration): GraphQL.SensorConfiguration {
    const { ...remainder } = rhs;

    return {
      ...remainder,
    };
  }

  public modelFromGraphql(
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
