import React from "react";
import gql from "graphql-tag";

import { ThermostatConfigurationsComponent } from "../generated/graphqlClient";

gql`
  query ThermostatConfigurations {
    getThermostatConfigurations {
      deviceId
      name
      allowedActions
      cadence
      setPointHeat
      setPointCool
      threshold
    }
  }
`;

const ThermostatConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <ThermostatConfigurationsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) return <p>Loading...</p>;
        if (error || !data || !data.getThermostatConfigurations)
          return <p>Error :( {JSON.stringify(error)}</p>;

        return (
          <div>
            {data.getThermostatConfigurations.map(
              (thermostatConfiguration): React.ReactElement => {
                return (
                  <div key={thermostatConfiguration.deviceId}>
                    {thermostatConfiguration.name}: {thermostatConfiguration.setPointCool} /{" "}
                    {thermostatConfiguration.setPointHeat} = {thermostatConfiguration.allowedActions}
                  </div>
                );
              }
            )}
          </div>
        );
      }}
    </ThermostatConfigurationsComponent>
  );
};

export default ThermostatConfigs;
