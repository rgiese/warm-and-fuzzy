import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlMutableStoreBase from "../GraphqlMutableStoreBase";

import {
  SensorConfigurationsStoreQuery,
  UpdateSensorConfigurationStoreMutation,
  UpdateSensorConfigurationStoreMutationVariables,
} from "../../generated/graphqlClient";

const sensorConfigurationFragments = gql`
  fragment SensorConfigurationStoreFields on SensorConfiguration {
    id
    name
    streamName
  }
`;

const sensorConfigurationsStoreDocument = gql`
  ${sensorConfigurationFragments}
  query SensorConfigurationsStore {
    getSensorConfigurations {
      ...SensorConfigurationStoreFields
    }
  }
`;

const updateSensorConfigurationStoreDocument = gql`
  ${sensorConfigurationFragments}
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
      updateSensorConfigurationStoreDocument,
      (item: SensorConfiguration) => {
        return { SensorConfiguration: item };
      },
      // Query
      sensorConfigurationsStoreDocument,
      (queryData: SensorConfigurationsStoreQuery) => {
        return queryData.getSensorConfigurations;
      }
    );
  }
}
