import React from "react";
import { ScrollView, Text } from "react-native";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { observer } from "mobx-react";

import IndexedThermostatSetting from "./IndexedThermostatSetting";

import BaseView from "../components/BaseView";
import ScreenBaseStyles from "../screens/ScreenBaseStyles";

export interface ThermostatSettingNavigationParams extends NavigationParams {
  thermostatSetting: IndexedThermostatSetting;
}

const ThermostatSettingScreen: NavigationStackScreenComponent<ThermostatSettingNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  const thermostatSetting = navigation.state.params?.thermostatSetting;

  if (!thermostatSetting) {
    return <Text>Error: thermostat setting not specified.</Text>;
  }

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        <Text>Florp.</Text>
      </ScrollView>
    </BaseView>
  );
};

ThermostatSettingScreen.navigationOptions = ({ navigation }) => {
  const thermostatSetting = navigation.state.params?.thermostatSetting;

  return {
    title: `${thermostatSetting?.type || ""} setting`,
  };
};

export default observer(ThermostatSettingScreen);
