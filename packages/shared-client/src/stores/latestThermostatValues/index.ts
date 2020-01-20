import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import { ApolloClient } from "../../services/ApolloClient";

import { GraphqlStoreBase } from "../GraphqlStoreBase";
import { AuthStore } from "../auth";

import { LatestThermostatValuesStoreQuery } from "../../generated/graphqlClient";

const latestThermostatValuesStoreDocument = gql`
  query LatestThermostatValuesStore {
    getLatestThermostatValues {
      id
      deviceTime
      currentActions
      temperature
      humidity
      setPointHeat
      setPointCool
    }
  }
`;

export type LatestThermostatValue = TypeTools.ArrayElementType<
  TypeTools.PropType<LatestThermostatValuesStoreQuery, "getLatestThermostatValues">
>;

export class LatestThermostatValuesStore extends GraphqlStoreBase<
  LatestThermostatValue,
  LatestThermostatValuesStoreQuery
> {
  public constructor(authStore: AuthStore, apolloClient: ApolloClient) {
    super(
      "LatestThermostatValues",
      authStore,
      apolloClient,
      latestThermostatValuesStoreDocument,
      (queryData: LatestThermostatValuesStoreQuery) => {
        return queryData.getLatestThermostatValues;
      },
      (latestValue: LatestThermostatValue) => {
        // Rehydrate Date types
        return { ...latestValue, deviceTime: new Date(latestValue.deviceTime) };
      }
    );
  }
}
