import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlMutableStoreBase from "../GraphqlMutableStoreBase";

import {
  ThermostatConfigurationsStoreDocument,
  ThermostatConfigurationsStoreQuery,
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
      ...ThermostatConfigurationFields
    }
  }

  mutation UpdateThermostatConfigurationStore(
    $thermostatConfiguration: ThermostatConfigurationUpdateInput!
  ) {
    updateThermostatConfiguration(thermostatConfiguration: $thermostatConfiguration) {
      ...ThermostatConfigurationFields
    }
  }
`;

export type ThermostatConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatConfigurationsStoreQuery, "getThermostatConfigurations">
>;

export class ThermostatConfigurationStore extends GraphqlMutableStoreBase<
  ThermostatConfiguration,
  ThermostatConfigurationsStoreQuery
> {
  public constructor() {
    super(
      ThermostatConfigurationsStoreDocument,
      (queryData: ThermostatConfigurationsStoreQuery) => {
        return queryData.getThermostatConfigurations;
      }
    );
  }
}
