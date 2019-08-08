import React from "react";
import { Text } from "react-native";
import gql from "graphql-tag";

import { LatestValuesComponent } from "../../generated/graphqlClient";

gql`
  query LatestValues {
    getLatestValues {
      sensorId
      deviceTime
      temperature
      humidity
    }
    getThermostatConfigurations {
      deviceId
      name
    }
    getSensorConfigurations {
      sensorId
      name
    }
  }
`;

const LatestValues: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <LatestValuesComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <Text>Loading...</Text>;
        }

        if (error || !data || !data.getLatestValues) {
          return (
            <Text>
              Error: <pre>{JSON.stringify(error)}</pre>
            </Text>
          );
        }

        // Rehydrate custom types
        data.getLatestValues.forEach((v): void => {
          v.deviceTime = new Date(v.deviceTime);
        });

        // Build maps
        const sensorNames = new Map(
          data.getThermostatConfigurations
            .map((c): [string, string] => [c.deviceId, c.name])
            .concat(data.getSensorConfigurations.map((c): [string, string] => [c.sensorId, c.name]))
        );

        // Sort by date, descending
        const sortedValues = data.getLatestValues.sort(
          (lhs, rhs): number => rhs.deviceTime.getTime() - lhs.deviceTime.getTime()
        );

        return (
          <>
            {sortedValues.map(
              (latestValue): React.ReactElement => {
                return (
                  <Text key={latestValue.sensorId}>
                    {sensorNames.get(latestValue.sensorId) || latestValue.sensorId} -
                    {latestValue.deviceTime.toLocaleString()} -{latestValue.temperature} -
                    {latestValue.humidity || ""}
                  </Text>
                );
              }
            )}
          </>
        );
      }}
    </LatestValuesComponent>
  );
};

export default LatestValues;
