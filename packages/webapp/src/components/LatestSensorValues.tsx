import React from "react";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import gql from "graphql-tag";
import { LatestSensorValuesComponent, LatestSensorValuesQuery } from "../generated/graphqlClient";

gql`
  query LatestSensorValues {
    getLatestSensorValues {
      id
      deviceTime
      temperature
    }
    getSensorConfigurations {
      id
      name
    }
  }
`;

type SensorValue = TypeTools.ArrayElementType<
  TypeTools.PropType<LatestSensorValuesQuery, "getLatestSensorValues">
> & { name: string };

const tableDefinition: TableFieldDefinition<SensorValue>[] = [
  { field: "name", label: "Sensor" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature" },
];

const LatestSensorValues: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <LatestSensorValuesComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getLatestSensorValues) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        // Rehydrate custom types
        data.getLatestSensorValues.forEach((v): void => {
          v.deviceTime = new Date(v.deviceTime);
        });

        // Build maps
        const sensorNames = new Map(
          data.getSensorConfigurations.map((c): [string, string] => [c.id, c.name])
        );

        // Project data
        const values = data.getLatestSensorValues.map(
          (value): SensorValue => {
            return { ...value, name: sensorNames.get(value.id) || value.id };
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
    </LatestSensorValuesComponent>
  );
};

export default LatestSensorValues;
