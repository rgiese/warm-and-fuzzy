import React from "react";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import BaseView from "../components/BaseView";
import ThermostatConfiguration from "../components/ThermostatConfiguration";

export interface ThermostatNavigationParams {
  deviceId: string;
}

interface Props {
  navigation: NavigationScreenProp<NavigationState, ThermostatNavigationParams>;
}

class State {}

class ThermostatScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Thermostat settings",
  };

  public render(): React.ReactElement {
    return (
      <BaseView>
        <ThermostatConfiguration deviceId={this.props.navigation.state.params.deviceId} />
      </BaseView>
    );
  }
}

export default ThermostatScreen;
