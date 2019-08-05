import React from "react";
import gql from "graphql-tag";

import { LatestActionsComponent } from "../generated/graphqlClient";

gql`
  fragment DeviceActionFields on DeviceAction {
    deviceId
    deviceTime
    currentActions
  }

  query LatestActions {
    getLatestActions {
      ...DeviceActionFields
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
                      <pre>{latestAction.deviceId}</pre>
                    </div>
                    <div className="dtc pa2">{latestAction.deviceTime.toLocaleString()}</div>
                    <div className="dtc pa2">{latestAction.currentActions}</div>
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
