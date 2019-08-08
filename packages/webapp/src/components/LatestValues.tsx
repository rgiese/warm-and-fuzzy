import React from "react";
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
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getLatestValues) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
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
          <div className="dt tl sans center mw-8 pt3">
            <div className="dtr b ba b--black">
              <div className="dtc pa2">ID</div>
              <div className="dtc pa2">Time</div>
              <div className="dtc pa2">Temperature</div>
              <div className="dtc pa2">Humidity</div>
            </div>
            {sortedValues.map(
              (latestValue): React.ReactElement => {
                return (
                  <div className="dtr">
                    <div className="dtc pa2">
                      {sensorNames.get(latestValue.sensorId) || latestValue.sensorId}
                    </div>
                    <div className="dtc pa2">{latestValue.deviceTime.toLocaleString()}</div>
                    <div className="dtc pa2">{latestValue.temperature}</div>
                    <div className="dtc pa2">{latestValue.humidity || ""}</div>
                  </div>
                );
              }
            )}
          </div>
        );
      }}
    </LatestValuesComponent>
  );
};

export default LatestValues;
