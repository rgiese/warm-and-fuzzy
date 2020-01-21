import * as GraphQL from "../../generated/graphqlClient";

import { Button, List } from "react-native-paper";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ThermostatSettingsHelpers, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import BaseView from "../components/BaseView";
import { IconNames } from "../Theme";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import React from "react";
import ScreenBaseStyles from "./ScreenBaseStyles";
import ScreenRoutes from "./ScreenRoutes";
import SetpointDisplay from "../components/SetpointDisplay";
import { ThermostatSettingNavigationParams } from "./ThermostatSettingScreen";
import { TouchableOpacity } from "react-native-gesture-handler";
import { observer } from "mobx-react";

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

  const rootStore = useRootStore();

  const thermostatSettings = rootStore.thermostatSettingsStore.findById(
    navigation.state.params?.thermostatId ?? "0"
  );

  if (!thermostatSettings) {
    return <Text>Error: thermostat settings not found.</Text>;
  }

  const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
    thermostatSettings.id
  );

  const availableActions = thermostatConfiguration?.availableActions ?? [];

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
            icon={IconNames.Hold}
            mode="contained"
            onPress={(): void => {
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
            icon={IconNames.Scheduled}
            mode="outlined"
            onPress={(): void => {
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
              // eslint-disable-next-line react/no-array-index-key
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
              onPress={(): void => {
                const params: ThermostatSettingNavigationParams = {
                  mutableSettingsStore,
                  thermostatSetting,
                  availableActions,
                };
                navigation.navigate(ScreenRoutes.ThermostatSetting, params);
              }}
            >
              <List.Item
                description={
                  thermostatSetting.type === GraphQL.ThermostatSettingType.Hold
                    ? ThermostatSettingsHelpers.FormatHoldUntil(
                        thermostatSetting.holdUntil ?? new Date(0)
                      )
                    : `${ThermostatSettingsHelpers.FormatDaysOfWeekList(
                        thermostatSetting.daysOfWeek ?? []
                      )} at ${ThermostatSettingsHelpers.FormatMinutesSinceMidnight(
                        thermostatSetting.atMinutesSinceMidnight ?? 0
                      )}`
                }
                // List.Item doesn't declare a type for the props so don't bother with the following
                // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                left={(props): React.ReactNode => (
                  <List.Icon {...props} icon={IconNames[thermostatSetting.type]} />
                )}
                title={
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {[
                      GraphQL.ThermostatAction.Heat,
                      GraphQL.ThermostatAction.Cool,
                      GraphQL.ThermostatAction.Circulate,
                    ].map(action => (
                      <SetpointDisplay
                        action={action}
                        key={action}
                        thermostatSetting={thermostatSetting}
                      />
                    ))}
                  </>
                }
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </BaseView>
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
ThermostatSettingsScreen.navigationOptions = ({ navigation }) => {
  return {
    title: `${navigation.state.params?.thermostatName ?? "Thermostat"} settings`,
  };
};

export default observer(ThermostatSettingsScreen);
