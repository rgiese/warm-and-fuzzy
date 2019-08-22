import React from "react";
import { Table } from "semantic-ui-react";
import gql from "graphql-tag";

import { LatestThermostatValuesComponent } from "../generated/graphqlClient";

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

        // Sort by date, descending
        const sortedValues = data.getLatestThermostatValues.sort(
          (lhs, rhs): number => rhs.deviceTime.getTime() - lhs.deviceTime.getTime()
        );

        return (
          <Table basic="very" compact size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Thermostat</Table.HeaderCell>
                <Table.HeaderCell>Time</Table.HeaderCell>
                <Table.HeaderCell>Temperature</Table.HeaderCell>
                <Table.HeaderCell>Humidity</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedValues.map(
                (value): React.ReactElement => {
                  return (
                    <Table.Row key={value.id}>
                      <Table.Cell>{thermostatNames.get(value.id) || value.id}</Table.Cell>
                      <Table.Cell>{value.deviceTime.toLocaleString()}</Table.Cell>
                      <Table.Cell>{value.temperature}</Table.Cell>
                      <Table.Cell>{value.humidity || ""}</Table.Cell>
                      <Table.Cell>{value.currentActions.join(", ")}</Table.Cell>
                    </Table.Row>
                  );
                }
              )}
            </Table.Body>
          </Table>
        );
      }}
    </LatestThermostatValuesComponent>
  );
};

export default LatestThermostatValues;
