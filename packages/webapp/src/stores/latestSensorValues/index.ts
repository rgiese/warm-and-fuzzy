import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlStoreBase from "../GraphqlStoreBase";

import {
  LatestSensorValuesStoreDocument,
  LatestSensorValuesStoreQuery,
} from "../../generated/graphqlClient";

gql`
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
  public constructor() {
    super(
      LatestSensorValuesStoreDocument,
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
