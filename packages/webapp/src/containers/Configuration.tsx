import { Divider, Header } from "semantic-ui-react";

import React from "react";
import SensorConfigurations from "../components/SensorConfigurations";
import ThermostatConfigurations from "../components/ThermostatConfigurations";
import { observer } from "mobx-react";

function Configuration(): React.ReactElement {
  return (
    <>
      <Divider horizontal>
        <Header as="h4">Thermostats</Header>
      </Divider>
      <ThermostatConfigurations />

      <Divider horizontal style={{ paddingTop: "2em" }}>
        <Header as="h4">Sensors</Header>
      </Divider>
      <SensorConfigurations />
    </>
  );
}

export default observer(Configuration);
