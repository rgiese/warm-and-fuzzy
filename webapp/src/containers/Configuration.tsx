import React from "react";

import AuthStateProps from "../common/AuthStateProps";

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
    return <ThermostatConfigurations />;
  }
}

export default Configuration;
