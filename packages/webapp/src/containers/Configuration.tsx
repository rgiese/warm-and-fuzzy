import React from "react";
import { Divider, Header } from "semantic-ui-react";
import { observer } from "mobx-react";

import AuthStateProps from "../common/AuthStateProps";

import { RootStore } from "../stores/stores";

import SensorConfigurations from "../components/SensorConfigurations";
import ThermostatConfigurations from "../components/ThermostatConfigurations";

interface Props extends AuthStateProps {
  rootStore: RootStore;
}

class State {}

@observer
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
        <ThermostatConfigurations rootStore={this.props.rootStore} />

        <Divider horizontal style={{ paddingTop: "2em" }}>
          <Header as="h4">Sensors</Header>
        </Divider>
        <SensorConfigurations rootStore={this.props.rootStore} />
      </>
    );
  }
}

export default Configuration;
