import React from "react";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import gql from "graphql-tag";
import {
  LatestThermostatValuesComponent,
  LatestThermostatValuesQuery,
} from "../generated/graphqlClient";

gql`
  query LatestThermostatValues {
    getLatestThermostatValues {
      id
      deviceTime
      currentActions
      temperature
      humidity
    }
    getThermostatConfigurations {
      id
      name
    }
  }
`;

type ThermostatValue = TypeTools.ArrayElementType<
  TypeTools.PropType<LatestThermostatValuesQuery, "getLatestThermostatValues">
> & { name: string };

const tableDefinition: TableFieldDefinition<ThermostatValue>[] = [
  { field: "name", label: "Thermostat" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature" },
  { field: "humidity", label: "Humidity" },
  { field: "currentActions", label: "Actions" },
];

const LatestThermostatValues: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <LatestThermostatValuesComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getLatestThermostatValues) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        // Rehydrate custom types
        data.getLatestThermostatValues.forEach((v): void => {
          v.deviceTime = new Date(v.deviceTime);
        });

        // Build maps
        const thermostatNames = new Map(
          data.getThermostatConfigurations.map((c): [string, string] => [c.id, c.name])
        );

        // Project data
        const values = data.getLatestThermostatValues.map(
          (value): ThermostatValue => {
            return { ...value, name: thermostatNames.get(value.id) || value.id };
          }
        );

        return (
          <SortableTable
            tableProps={{ basic: "very", collapsing: true, compact: true, size: "small" }}
            data={values}
            fieldDefinitions={tableDefinition}
            keyField="id"
            defaultSortField="name"
          />
        );
      }}
    </LatestThermostatValuesComponent>
  );
};

export default LatestThermostatValues;
