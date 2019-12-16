import React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { NavigationStackOptions } from "react-navigation-stack";

import BaseView from "../components/BaseView";
import ThermostatConfiguration from "../components/ThermostatConfiguration";

export interface ThermostatNavigationParams {
  thermostatId: string;
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

  static navigationOptions: NavigationStackOptions = {
    title: "Thermostat settings",
  };

  public render(): React.ReactElement {
    return (
      <BaseView>
        <ThermostatConfiguration
          thermostatId={this.props.navigation.state.params?.thermostatId || "0"}
        />
      </BaseView>
    );
  }
}

export default ThermostatScreen;
