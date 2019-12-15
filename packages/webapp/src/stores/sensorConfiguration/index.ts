import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlMutableStoreBase from "../GraphqlMutableStoreBase";

import {
  SensorConfigurationsStoreDocument,
  SensorConfigurationsStoreQuery,
  UpdateSensorConfigurationStoreDocument,
  UpdateSensorConfigurationStoreMutation,
  UpdateSensorConfigurationStoreMutationVariables,
} from "../../generated/graphqlClient";

gql`
  fragment SensorConfigurationStoreFields on SensorConfiguration {
    id
    name
    streamName
  }

  query SensorConfigurationsStore {
    getSensorConfigurations {
      ...SensorConfigurationStoreFields
    }
  }

  mutation UpdateSensorConfigurationStore($SensorConfiguration: SensorConfigurationUpdateInput!) {
    updateSensorConfiguration(sensorConfiguration: $SensorConfiguration) {
      ...SensorConfigurationStoreFields
    }
  }
`;

export type SensorConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<SensorConfigurationsStoreQuery, "getSensorConfigurations">
>;

export class SensorConfigurationStore extends GraphqlMutableStoreBase<
  SensorConfiguration,
  SensorConfigurationsStoreQuery,
  UpdateSensorConfigurationStoreMutation,
  UpdateSensorConfigurationStoreMutationVariables
> {
  public constructor() {
    super(
      // Mutation
      UpdateSensorConfigurationStoreDocument,
      (item: SensorConfiguration) => {
        return { SensorConfiguration: item };
      },
      // Query
      SensorConfigurationsStoreDocument,
      (queryData: SensorConfigurationsStoreQuery) => {
        return queryData.getSensorConfigurations;
      }
    );
  }
}
