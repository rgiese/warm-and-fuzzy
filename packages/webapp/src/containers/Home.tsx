import React from "react";
import { Divider, Header } from "semantic-ui-react";

import AuthStateProps from "../common/AuthStateProps";

import LatestThermostatValues from "../components/LatestThermostatValues";
import LatestSensorValues from "../components/LatestSensorValues";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

class Home extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  private renderLander(): React.ReactElement {
    return <div>Please log in via nav bar.</div>;
  }

  private renderContent(): React.ReactElement {
    return (
      <>
        <Divider horizontal>
          <Header as="h4">Thermostats</Header>
        </Divider>
        <LatestThermostatValues />

        <Divider horizontal style={{ paddingTop: "2em" }}>
          <Header as="h4">Sensors</Header>
        </Divider>
        <LatestSensorValues />
      </>
    );
  }

  public render(): React.ReactElement {
    return (
      <div className="pv4">
        {this.props.isAuthenticated ? this.renderContent() : this.renderLander()}
      </div>
    );
  }
}

export default Home;
