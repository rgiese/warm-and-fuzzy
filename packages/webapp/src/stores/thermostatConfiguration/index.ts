import { flow, observable } from "mobx";
import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import {
  ThermostatConfigurationsStoreDocument,
  ThermostatConfigurationsStoreQuery,
} from "../../generated/graphqlClient";
import ApolloClient from "../../services/ApolloClient";

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

type ThermostatConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatConfigurationsStoreQuery, "getThermostatConfigurations">
>;

export class ThermostatConfigurationStore {
  @observable state: "fetching" | "ready" | "error" = "fetching";
  error?: string;

  readonly thermostatConfigurations = observable.array<ThermostatConfiguration>([]);

  public constructor() {
    this.fetchData();
  }

  fetchData = flow(function*(this: ThermostatConfigurationStore) {
    this.state = "fetching";

    try {
      const queryResult = yield ApolloClient.query<ThermostatConfigurationsStoreQuery, {}>({
        query: ThermostatConfigurationsStoreDocument,
      });

      if (queryResult.errors) {
        throw new Error(queryResult.errors);
      }

      if (!queryResult.data || !queryResult.data.getThermostatConfigurations) {
        throw new Error("No data returned");
      }

      this.thermostatConfigurations.replace(queryResult.data.getThermostatConfigurations);
      this.state = "ready";
    } catch (error) {
      this.error = JSON.stringify(error);
      this.state = "error";
    }
  });
}
