import React from "react";
import { ScrollView } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";

import BaseView from "../components/BaseView";
import ThermostatConfiguration from "../components/ThermostatConfiguration";

export interface ThermostatNavigationParams {
  thermostatId: string;
}

const ThermostatScreen: NavigationStackScreenComponent<NavigationScreenProp<
  NavigationState,
  ThermostatNavigationParams
>> = ({ navigation }): React.ReactElement => {
  return (
    <BaseView>
      <ScrollView>
        <ThermostatConfiguration thermostatId={navigation.state.params?.thermostatId || "0"} />
      </ScrollView>
    </BaseView>
  );
};

ThermostatScreen.navigationOptions = {
  title: "Thermostat settings",
};

export default ThermostatScreen;
