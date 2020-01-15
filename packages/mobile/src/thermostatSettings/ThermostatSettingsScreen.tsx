import React, { useContext, useState } from "react";
import { ScrollView, Text } from "react-native";
import { List } from "react-native-paper";
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

const ThermostatSettingsScreen: NavigationStackScreenComponent<ThermostatNavigationParams> = ({
  navigation,
}): React.ReactElement => {
  //
  // State
  //

  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving
  );

  return (
    <BaseView>
      <ScrollView style={ScreenBaseStyles.topLevelView}>
        {mutableSettingsStore.orderedSettings.map((thermostatSetting, index) => {
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
