import React from "react";
import gql from "graphql-tag";

import { LatestSensorValuesComponent } from "../generated/graphqlClient";

gql`
  query LatestSensorValues {
    getLatestSensorValues {
      id
      deviceTime
      temperature
      humidity
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
          <div className="dt tl sans center mw-8 pt3">
            <div className="dtr b ba b--black">
              <div className="dtc pa2">ID</div>
              <div className="dtc pa2">Time</div>
              <div className="dtc pa2">Temperature</div>
              <div className="dtc pa2">Humidity</div>
            </div>
            {sortedValues.map(
              (value): React.ReactElement => {
                return (
                  <div className="dtr">
                    <div className="dtc pa2">{sensorNames.get(value.id) || value.id}</div>
                    <div className="dtc pa2">{value.deviceTime.toLocaleString()}</div>
                    <div className="dtc pa2">{value.temperature}</div>
                    <div className="dtc pa2">{value.humidity || ""}</div>
                  </div>
                );
              }
            )}
          </div>
        );
      }}
    </LatestSensorValuesComponent>
  );
};

export default LatestSensorValues;
