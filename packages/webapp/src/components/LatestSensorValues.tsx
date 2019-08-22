import React from "react";
import { Table } from "semantic-ui-react";
import gql from "graphql-tag";

import { LatestSensorValuesComponent } from "../generated/graphqlClient";

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

        // Sort by date, descending
        const sortedValues = data.getLatestSensorValues.sort(
          (lhs, rhs): number => rhs.deviceTime.getTime() - lhs.deviceTime.getTime()
        );

        return (
          <Table basic="very" compact size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Sensor</Table.HeaderCell>
                <Table.HeaderCell>Time</Table.HeaderCell>
                <Table.HeaderCell>Temperature</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedValues.map(
                (value): React.ReactElement => {
                  return (
                    <Table.Row key={value.id}>
                      <Table.Cell>{sensorNames.get(value.id) || value.id}</Table.Cell>
                      <Table.Cell>{value.deviceTime.toLocaleString()}</Table.Cell>
                      <Table.Cell>{value.temperature}</Table.Cell>
                    </Table.Row>
                  );
                }
              )}
            </Table.Body>
          </Table>
        );
      }}
    </LatestSensorValuesComponent>
  );
};

export default LatestSensorValues;
