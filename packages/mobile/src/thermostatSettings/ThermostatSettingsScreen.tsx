import React, { useContext } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { NavigationParams } from "react-navigation";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { observer } from "mobx-react";
import cloneDeep from "clone-deep";

import {
  RootStoreContext,
  compareMaybeDate,
  compareMaybeNumber,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import BaseView from "../components/BaseView";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import ThermostatSettingsListItem from "./ThermostatSettingsListItem";

const styles = StyleSheet.create({
  // Top-level view
  componentView: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 20,
    paddingRight: 20,
  },
});

export interface ThermostatNavigationParams extends NavigationParams {
  thermostatId: string;
  thermostatName: string;
}

const ThermostatScreen: NavigationStackScreenComponent<ThermostatNavigationParams> = ({
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
      <ScrollView style={styles.componentView}>
        {orderedSettings.map((setting, index) => {
          return (
            <ThermostatSettingsListItem
              thermostatSetting={setting}
              availableActions={thermostatConfiguration?.availableActions || []}
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
            />
          );
        })}
      </ScrollView>
    </BaseView>
  );
};

ThermostatScreen.navigationOptions = ({ navigation }) => {
  return {
    title: `${navigation.state.params?.thermostatName || "Thermostat"} settings`,
  };
};

export default observer(ThermostatScreen);
