import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Theme, withTheme } from "react-native-paper";
import { observer } from "mobx-react";
import cloneDeep from "clone-deep";

import {
  RootStoreContext,
  ThermostatSettings,
  compareMaybeDate,
  compareMaybeNumber,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import IndexedThermostatSetting from "./thermostatSettings/IndexedThermostatSetting";
import ThermostatSettingBean from "./thermostatSettings/ThermostatSettingBean";

const styles = StyleSheet.create({
  // Top-level view
  componentView: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 20,
    paddingRight: 20,
  },
  // Thermostat label
  thermostatLabel: {
    fontSize: 20,
    paddingBottom: 4,
    paddingTop: 4,
  },
});

const ThermostatSettingsComponent: React.FunctionComponent<{
  thermostatSettings: ThermostatSettings;
  theme: Theme;
}> = ({ thermostatSettings }): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
    thermostatSettings.id
  );

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
    <View style={styles.componentView}>
      {/* Name */}
      <Text style={styles.thermostatLabel}>
        {thermostatConfiguration?.name || thermostatSettings.id}
      </Text>

      {orderedSettings.map((setting, index) => {
        return (
          <ThermostatSettingBean
            thermostatSetting={setting}
            availableActions={thermostatConfiguration?.availableActions || []}
            key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
          />
        );
      })}
    </View>
  );
};

export default withTheme(observer(ThermostatSettingsComponent));
