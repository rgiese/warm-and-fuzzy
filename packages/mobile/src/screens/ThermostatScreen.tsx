import React, { useContext } from "react";
import { ScrollView, Text } from "react-native";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import BaseView from "../components/BaseView";
import ThermostatSettings from "../components/ThermostatSettings";

export interface ThermostatNavigationParams extends NavigationParams {
  thermostatId: string;
}

const ThermostatScreen: NavigationStackScreenComponent<ThermostatNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  const thermostatSettings = rootStore.thermostatSettingsStore.findById(
    navigation.state.params?.thermostatId || "0"
  );

  if (!thermostatSettings) {
    return <Text>Error: thermostat settings not found.</Text>;
  }

  return (
    <BaseView>
      <ScrollView>
        <ThermostatSettings thermostatSettings={thermostatSettings} />
      </ScrollView>
    </BaseView>
  );
};

ThermostatScreen.navigationOptions = {
  title: "Thermostat settings",
};

export default ThermostatScreen;
