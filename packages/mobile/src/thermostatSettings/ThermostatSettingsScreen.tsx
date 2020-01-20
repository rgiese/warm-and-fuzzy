import React, { useContext } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, List } from "react-native-paper";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { TouchableOpacity } from "react-native-gesture-handler";
import { observer } from "mobx-react";

import {
  RootStoreContext,
  ThermostatSettingsHelpers,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import BaseView from "../components/BaseView";
import ScreenBaseStyles from "../screens/ScreenBaseStyles";
import { IconNames } from "../Theme";

import { ThermostatSettingNavigationParams } from "./ThermostatSettingScreen";
import ScreenRoutes from "../screens/ScreenRoutes";

import SetpointDisplay from "./SetpointDisplay";

export interface ThermostatNavigationParams extends NavigationParams {
  thermostatId: string;
  thermostatName: string;
}

const styles = StyleSheet.create({
  addButtonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
  },
});

const ThermostatSettingsScreen: NavigationStackScreenComponent<ThermostatNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  //
  // Parse parameters
  //

  const rootStore = useContext(RootStoreContext).rootStore;

  const thermostatSettings = rootStore.thermostatSettingsStore.findById(
    navigation.state.params?.thermostatId || "0"
  );

  if (!thermostatSettings) {
    return <Text>Error: thermostat settings not found.</Text>;
  }

  const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
    thermostatSettings.id
  );

  const availableActions = thermostatConfiguration?.availableActions || [];

  const mutableSettingsStore = new ThermostatSettingsHelpers.MutableSettingsStore(
    rootStore.thermostatSettingsStore,
    thermostatSettings,
    (_isSaving: boolean) => {
      /* managed inside ThermostatSettingScreen */
    }
  );

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        <View style={styles.addButtonRow}>
          {/* Add Hold button */}
          <Button
            mode="contained"
            icon={IconNames.Hold}
            onPress={() => {
              const params: ThermostatSettingNavigationParams = {
                mutableSettingsStore,
                thermostatSetting: mutableSettingsStore.newHoldSettingTemplate,
                availableActions,
                isNewSetting: true,
              };
              navigation.navigate(ScreenRoutes.ThermostatSetting, params);
            }}
          >
            Add Hold
          </Button>

          {/* Add Schedule button */}
          <Button
            mode="outlined"
            icon={IconNames.Scheduled}
            onPress={() => {
              const params: ThermostatSettingNavigationParams = {
                mutableSettingsStore,
                thermostatSetting: mutableSettingsStore.newScheduledSettingTemplate,
                availableActions,
                isNewSetting: true,
              };
              navigation.navigate(ScreenRoutes.ThermostatSetting, params);
            }}
          >
            Add Schedule
          </Button>
        </View>

        {mutableSettingsStore.orderedSettings.map((thermostatSetting, index) => {
          return (
            <TouchableOpacity
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
              onPress={() => {
                const params: ThermostatSettingNavigationParams = {
                  mutableSettingsStore,
                  thermostatSetting,
                  availableActions,
                };
                navigation.navigate(ScreenRoutes.ThermostatSetting, params);
              }}
            >
              <List.Item
                left={props => <List.Icon {...props} icon={IconNames[thermostatSetting.type]} />}
                title={
                  <>
                    {[
                      GraphQL.ThermostatAction.Heat,
                      GraphQL.ThermostatAction.Cool,
                      GraphQL.ThermostatAction.Circulate,
                    ].map(action => (
                      <SetpointDisplay
                        action={action}
                        thermostatSetting={thermostatSetting}
                        key={action}
                      />
                    ))}
                  </>
                }
                description={
                  thermostatSetting.type === GraphQL.ThermostatSettingType.Hold
                    ? ThermostatSettingsHelpers.FormatHoldUntil(
                        thermostatSetting.holdUntil || new Date(0)
                      )
                    : `${ThermostatSettingsHelpers.FormatDaysOfWeekList(
                        thermostatSetting.daysOfWeek || []
                      )} at ${ThermostatSettingsHelpers.FormatMinutesSinceMidnight(
                        thermostatSetting.atMinutesSinceMidnight || 0
                      )}`
                }
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </BaseView>
  );
};

ThermostatSettingsScreen.navigationOptions = ({ navigation }) => {
  return {
    title: `${navigation.state.params?.thermostatName || "Thermostat"} settings`,
  };
};

export default observer(ThermostatSettingsScreen);
