import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import { ApolloClient } from "../../services/ApolloClient";

import { GraphqlMutableStoreBase } from "../GraphqlMutableStoreBase";
import { AuthStore } from "../auth";

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
    timezone
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
  public constructor(authStore: AuthStore, apolloClient: ApolloClient) {
    super(
      "ThermostatConfiguration",
      authStore,
      apolloClient,
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
