import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlMutableStoreBase from "../GraphqlMutableStoreBase";

import {
  ThermostatConfigurationsStoreDocument,
  ThermostatConfigurationsStoreQuery,
  UpdateThermostatConfigurationStoreDocument,
  UpdateThermostatConfigurationStoreMutation,
  UpdateThermostatConfigurationStoreMutationVariables,
} from "../../generated/graphqlClient";

gql`
  fragment ThermostatConfigurationStoreFields on ThermostatConfiguration {
    id
    name
    streamName
    availableActions
    allowedActions
    setPointHeat
    setPointCool
    threshold
    cadence
  }

  query ThermostatConfigurationsStore {
    getThermostatConfigurations {
      ...ThermostatConfigurationStoreFields
    }
  }

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
      UpdateThermostatConfigurationStoreDocument,
      (item: ThermostatConfiguration) => {
        return { thermostatConfiguration: item };
      },
      // Query
      ThermostatConfigurationsStoreDocument,
      (queryData: ThermostatConfigurationsStoreQuery) => {
        return queryData.getThermostatConfigurations;
      }
    );
  }
}
