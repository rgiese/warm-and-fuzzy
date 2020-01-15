import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Switch, Text } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { observer } from "mobx-react";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../generated/graphqlClient";

import BaseView from "../components/BaseView";
import ScreenBaseStyles from "../screens/ScreenBaseStyles";

import * as ThemedText from "../components/ThemedText";
import { ColorCodes } from "../Theme";

import IndexedThermostatSetting from "./IndexedThermostatSetting";

const styles = StyleSheet.create({
  // One row per set point
  setPointRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  // Left column: text
  setPointText: {
    flex: 2,
    fontSize: 16,
  },
  // Center column: slider
  setPointSlider: {
    flex: 3,
    height: 12,
    width: 100,
  },
  // Right column: switch
  setPointSwitch: {
    flex: 1,
  },
  // Final row
  saveButtonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 16,
  },
});

export interface ThermostatSettingNavigationParams extends NavigationParams {
  thermostatSetting: IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
}

const ThermostatSettingScreen: NavigationStackScreenComponent<ThermostatSettingNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  const [mutableSetting, updateMutableSetting] = useState(
    navigation.state.params?.thermostatSetting || ({} as IndexedThermostatSetting)
  );

  if (!navigation.state.params) {
    return <Text>Error: parameters missing.</Text>;
  }

  const availableActions = navigation.state.params.availableActions;

  //
  // Functions to change in-flight (editing) state
  //

  const onChangeAllowedAction = (action: GraphQL.ThermostatAction, allowed: boolean) => {
    let actions = mutableSetting.allowedActions.filter(a => a !== action);

    if (allowed) {
      actions.push(action);
    }

    updateMutableSetting({ ...mutableSetting, allowedActions: actions });
  };

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        {/* Set point: Heat */}
        {availableActions.includes(GraphQL.ThermostatAction.Heat) && (
          <View style={styles.setPointRow}>
            <Text style={styles.setPointText}>
              <ThemedText.Heat>Heat</ThemedText.Heat> to {mutableSetting.setPointHeat} &deg;C
            </Text>
            <Slider
              style={styles.setPointSlider}
              value={mutableSetting.setPointHeat}
              onValueChange={(value): void =>
                updateMutableSetting({ ...mutableSetting, setPointHeat: value })
              }
              minimumValue={ThermostatConfigurationSchema.SetPointRange.min}
              maximumValue={ThermostatConfigurationSchema.SetPointRange.max}
              step={1}
              minimumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              maximumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
              thumbTintColor={ColorCodes[GraphQL.ThermostatAction.Heat]}
            />
            <Switch
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Heat)}
              onValueChange={value => onChangeAllowedAction(GraphQL.ThermostatAction.Heat, value)}
              color={ColorCodes[GraphQL.ThermostatAction.Heat]}
            />
          </View>
        )}

        {/* Set point: Cool */}
        {availableActions.includes(GraphQL.ThermostatAction.Cool) && (
          <View style={styles.setPointRow}>
            <Text style={styles.setPointText}>
              <ThemedText.Cool>Cool</ThemedText.Cool> to {mutableSetting.setPointCool} &deg;C
            </Text>
            <Slider
              style={styles.setPointSlider}
              value={mutableSetting.setPointCool}
              onValueChange={(value): void =>
                updateMutableSetting({ ...mutableSetting, setPointCool: value })
              }
              minimumValue={ThermostatConfigurationSchema.SetPointRange.min}
              maximumValue={ThermostatConfigurationSchema.SetPointRange.max}
              step={1}
              minimumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              maximumTrackTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
              thumbTintColor={ColorCodes[GraphQL.ThermostatAction.Cool]}
            />
            <Switch
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Cool)}
              onValueChange={value => onChangeAllowedAction(GraphQL.ThermostatAction.Cool, value)}
              color={ColorCodes[GraphQL.ThermostatAction.Cool]}
            />
          </View>
        )}

        {/* Set point: Circulate */}
        {availableActions.includes(GraphQL.ThermostatAction.Circulate) && (
          <View style={styles.setPointRow}>
            <ThemedText.Circulate style={styles.setPointText}>Circulate</ThemedText.Circulate>
            <View style={styles.setPointSlider}>{/* Empty */}</View>
            <Switch
              style={styles.setPointSwitch}
              value={mutableSetting.allowedActions.includes(GraphQL.ThermostatAction.Circulate)}
              onValueChange={value =>
                onChangeAllowedAction(GraphQL.ThermostatAction.Circulate, value)
              }
              color={ColorCodes[GraphQL.ThermostatAction.Circulate]}
            />
          </View>
        )}
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
