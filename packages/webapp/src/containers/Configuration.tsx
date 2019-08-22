import React from "react";
import { Divider, Header } from "semantic-ui-react";

import AuthStateProps from "../common/AuthStateProps";

import SensorConfigurations from "../components/SensorConfigurations";
import ThermostatConfigurations from "../components/ThermostatConfigurations";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

class Configuration extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  public render(): React.ReactElement {
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
}

export default Configuration;
