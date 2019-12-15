import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import GraphqlStoreBase from "../GraphqlStoreBase";

import {
  LatestThermostatValuesStoreDocument,
  LatestThermostatValuesStoreQuery,
} from "../../generated/graphqlClient";

gql`
  query LatestThermostatValuesStore {
    getLatestThermostatValues {
      id
      deviceTime
      currentActions
      temperature
      humidity
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
  public constructor() {
    super(
      LatestThermostatValuesStoreDocument,
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