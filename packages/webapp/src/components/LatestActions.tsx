import React from "react";
import gql from "graphql-tag";

import { LatestActionsComponent } from "../../generated/graphqlClient";

gql`
  query LatestActions {
    getLatestActions {
      deviceId
      deviceTime
      currentActions
    }
    getThermostatConfigurations {
      deviceId
      name
    }
  }
`;

const LatestActions: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <LatestActionsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getLatestActions) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        // Rehydrate custom types
        data.getLatestActions.forEach((a): void => {
          a.deviceTime = new Date(a.deviceTime);
        });

        // Build maps
        const thermostatNames = new Map(
          data.getThermostatConfigurations.map((c): [string, string] => [c.deviceId, c.name])
        );

        // Sort by date, descending
        const sortedActions = data.getLatestActions.sort(
          (lhs, rhs): number => rhs.deviceTime.getTime() - lhs.deviceTime.getTime()
        );

        return (
          <div className="dt tl sans center mw-8 pt3">
            <div className="dtr b ba b--black">
              <div className="dtc pa2">ID</div>
              <div className="dtc pa2">Time</div>
              <div className="dtc pa2">Actions</div>
            </div>
            {sortedActions.map(
              (latestAction): React.ReactElement => {
                return (
                  <div className="dtr">
                    <div className="dtc pa2">
                      {thermostatNames.get(latestAction.deviceId) || latestAction.deviceId}
                    </div>
                    <div className="dtc pa2">{latestAction.deviceTime.toLocaleString()}</div>
                    <div className="dtc pa2">{latestAction.currentActions.join(", ")}</div>
                  </div>
                );
              }
            )}
          </div>
        );
      }}
    </LatestActionsComponent>
  );
};

export default LatestActions;
