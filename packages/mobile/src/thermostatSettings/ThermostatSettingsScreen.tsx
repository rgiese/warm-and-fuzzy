import React, { useContext } from "react";
import { ScrollView, Text } from "react-native";
import { List } from "react-native-paper";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { TouchableOpacity } from "react-native-gesture-handler";
import { observer } from "mobx-react";
import cloneDeep from "clone-deep";

import {
  RootStoreContext,
  compareMaybeDate,
  compareMaybeNumber,
  ThermostatSettingsHelpers,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import BaseView from "../components/BaseView";
import ScreenBaseStyles from "../screens/ScreenBaseStyles";
import { IconNames } from "../Theme";

import { ThermostatSettingNavigationParams } from "./ThermostatSettingScreen";
import ScreenRoutes from "../screens/ScreenRoutes";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import SetpointDisplay from "./SetpointDisplay";

export interface ThermostatNavigationParams extends NavigationParams {
  thermostatId: string;
  thermostatName: string;
}

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

  //
  // Prep data
  //

  // Deep-clone settings array so we can sort it here and mutate it in child components;
  // also inject indexes to map settings back to store definition.
  // (Deep-cloning may be overkill, but we want to be sure not to mutate the store directly at any point.)
  const localSettingsArray = cloneDeep(thermostatSettings.settings).map(
    (thermostatSetting, index): IndexedThermostatSetting => {
      return { ...thermostatSetting, index };
    }
  );

  const holdSettings = localSettingsArray
    .filter(setting => setting.type === GraphQL.ThermostatSettingType.Hold)
    .sort((lhs, rhs): number => compareMaybeDate(lhs.holdUntil, rhs.holdUntil));

  const scheduledSettings = localSettingsArray
    .filter(setting => setting.type === GraphQL.ThermostatSettingType.Scheduled)
    .sort((lhs, rhs): number =>
      compareMaybeNumber(lhs.atMinutesSinceMidnight, rhs.atMinutesSinceMidnight)
    );

  const orderedSettings = holdSettings.concat(scheduledSettings);

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        {orderedSettings.map((thermostatSetting, index) => {
          return (
            <TouchableOpacity
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
              onPress={() => {
                const params: ThermostatSettingNavigationParams = {
                  availableActions,
                  thermostatSetting,
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
