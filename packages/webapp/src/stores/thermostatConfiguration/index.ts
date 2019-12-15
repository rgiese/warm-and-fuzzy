import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlMutableStoreBase from "../GraphqlMutableStoreBase";

import {
  ThermostatConfigurationsStoreQuery,
  UpdateThermostatConfigurationStoreMutation,
  UpdateThermostatConfigurationStoreMutationVariables,
} from "../../generated/graphqlClient";

const thermostatConfigurationsFragment = gql`
  fragment ThermostatConfigurationStoreFields on ThermostatConfiguration {
    id
    name
    streamName
    availableActions
    externalSensorId
    allowedActions
    setPointHeat
    setPointCool
    threshold
    cadence
  }
`;

const thermostatConfigurationsStoreDocument = gql`
  ${thermostatConfigurationsFragment}
  query ThermostatConfigurationsStore {
    getThermostatConfigurations {
      ...ThermostatConfigurationStoreFields
    }
  }
`;

const updateThermostatConfigurationStoreDocument = gql`
  ${thermostatConfigurationsFragment}
  mutation UpdateThermostatConfigurationStore(
    $thermostatConfiguration: ThermostatConfigurationUpdateInput!
  ) {
    updateThermostatConfiguration(thermostatConfiguration: $thermostatConfiguration) {
      ...ThermostatConfigurationStoreFields
    }
  }
`;

export type ThermostatConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatConfigurationsStoreQuery, "getThermostatConfigurations">
>;

export class ThermostatConfigurationStore extends GraphqlMutableStoreBase<
  ThermostatConfiguration,
  ThermostatConfigurationsStoreQuery,
  UpdateThermostatConfigurationStoreMutation,
  UpdateThermostatConfigurationStoreMutationVariables
> {
  public constructor() {
    super(
      // Mutation
      updateThermostatConfigurationStoreDocument,
      (item: ThermostatConfiguration) => {
        return { thermostatConfiguration: item };
      },
      // Query
      thermostatConfigurationsStoreDocument,
      (queryData: ThermostatConfigurationsStoreQuery) => {
        return queryData.getThermostatConfigurations;
      }
    );
  }
}
