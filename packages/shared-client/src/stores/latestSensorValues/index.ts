import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import { ApolloClient } from "../../services/ApolloClientBase";

import { GraphqlStoreBase } from "../GraphqlStoreBase";
import { AuthStore } from "../auth";

import { LatestSensorValuesStoreQuery } from "../../generated/graphqlClient";

const latestSensorValuesStoreDocument = gql`
  query LatestSensorValuesStore {
    getLatestSensorValues {
      id
      deviceTime
      temperature
    }
  }
`;

export type LatestSensorValue = TypeTools.ArrayElementType<
  TypeTools.PropType<LatestSensorValuesStoreQuery, "getLatestSensorValues">
>;

export class LatestSensorValuesStore extends GraphqlStoreBase<
  LatestSensorValue,
  LatestSensorValuesStoreQuery
> {
  public constructor(authStore: AuthStore, apolloClient: ApolloClient.ApolloClientBase) {
    super(
      "LatestSensorValues",
      authStore,
      apolloClient,
      latestSensorValuesStoreDocument,
      (queryData: LatestSensorValuesStoreQuery) => {
        return queryData.getLatestSensorValues;
      },
      (latestValue: LatestSensorValue) => {
        // Rehydrate Date types
        return { ...latestValue, deviceTime: new Date(latestValue.deviceTime) };
      }
    );
  }
}
