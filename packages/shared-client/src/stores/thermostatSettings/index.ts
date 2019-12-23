import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import { ApolloClient } from "../../services/ApolloClient";

import { GraphqlMutableStoreBase } from "../GraphqlMutableStoreBase";
import { AuthStore } from "../auth";

import {
  ThermostatSettingsStoreQuery,
  UpdateThermostatSettingsStoreMutation,
  UpdateThermostatSettingsStoreMutationVariables,
} from "../../generated/graphqlClient";

const thermostatSettingsFragment = gql`
  fragment ThermostatSettingsStoreFields on ThermostatSettings {
    id
    settings {
      type
      holdUntil
      daysOfWeek
      atMinutesSinceMidnight
      allowedActions
      setPointHeat
      setPointCool
    }
  }
`;

const thermostatSettingsStoreDocument = gql`
  ${thermostatSettingsFragment}
  query ThermostatSettingsStore {
    getThermostatSettings {
      ...ThermostatSettingsStoreFields
    }
  }
`;

const updateThermostatSettingsStoreDocument = gql`
  ${thermostatSettingsFragment}
  mutation UpdateThermostatSettingsStore($thermostatSettings: ThermostatSettingsUpdateInput!) {
    updateThermostatSettings(thermostatSettings: $thermostatSettings) {
      ...ThermostatSettingsStoreFields
    }
  }
`;

export type ThermostatSettings = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatSettingsStoreQuery, "getThermostatSettings">
>;

export class ThermostatSettingsStore extends GraphqlMutableStoreBase<
  ThermostatSettings,
  ThermostatSettingsStoreQuery,
  UpdateThermostatSettingsStoreMutation,
  UpdateThermostatSettingsStoreMutationVariables
> {
  public constructor(authStore: AuthStore, apolloClient: ApolloClient) {
    super(
      "ThermostatSettings",
      authStore,
      apolloClient,
      // Mutation
      updateThermostatSettingsStoreDocument,
      (item: ThermostatSettings) => {
        return { thermostatSettings: item };
      },
      // Query
      thermostatSettingsStoreDocument,
      (queryData: ThermostatSettingsStoreQuery) => {
        return queryData.getThermostatSettings;
      }
    );
  }
}
