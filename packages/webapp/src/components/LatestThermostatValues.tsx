import React from "react";
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
          <div className="dt tl sans center mw-8 pt3">
            <div className="dtr b ba b--black">
              <div className="dtc pa2">ID</div>
              <div className="dtc pa2">Time</div>
              <div className="dtc pa2">Temperature</div>
              <div className="dtc pa2">Humidity</div>
              <div className="dtc pa2">Actions</div>
            </div>
            {sortedValues.map(
              (value): React.ReactElement => {
                return (
                  <div className="dtr">
                    <div className="dtc pa2">{thermostatNames.get(value.id) || value.id}</div>
                    <div className="dtc pa2">{value.deviceTime.toLocaleString()}</div>
                    <div className="dtc pa2">{value.temperature}</div>
                    <div className="dtc pa2">{value.humidity || ""}</div>
                    <div className="dtc pa2">{value.currentActions.join(", ")}</div>
                  </div>
                );
              }
            )}
          </div>
        );
      }}
    </LatestThermostatValuesComponent>
  );
};

export default LatestThermostatValues;
