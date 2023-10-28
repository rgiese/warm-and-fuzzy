import {
  ThermostatSettingsStoreQuery,
  UpdateThermostatSettingsStoreMutation,
  UpdateThermostatSettingsStoreMutationVariables,
} from "../../generated/graphqlClient";

import { ApolloClient } from "../../services/ApolloClient";
import { AuthStore } from "../auth";
import { GraphqlMutableStoreBase } from "../GraphqlMutableStoreBase";
import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";
import gql from "graphql-tag";

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
      setPointCirculateAbove
      setPointCirculateBelow
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

export type ThermostatSetting = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatSettings, "settings">
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
      },
      (thermostatSettings: ThermostatSettings) => {
        // Rehydrate Date types
        return {
          ...thermostatSettings,
          settings: thermostatSettings.settings.map(setting => {
            // Remove GraphQL-injected fields that won't be accepted in a GraphQL mutation
            // (done automatically for us for top-level types but not for interior arrays)
            const { __typename, ...rest } = setting;

            return {
              ...rest,
              holdUntil: setting.holdUntil ? new Date(setting.holdUntil) : undefined,
            };
          }),
        };
      }
    );
  }
}
