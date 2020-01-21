import * as ThemedText from "./ThemedText";

import { ColorCodes, IconNames } from "../Theme";
import { FlatList, StyleSheet, View } from "react-native";
import {
  LatestThermostatValue,
  ThermostatConfiguration,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import { NavigationRoute, NavigationScreenProp, withNavigation } from "react-navigation";
import React, { useEffect, useState } from "react";
import { Text, Theme, withTheme } from "react-native-paper";

import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";
import ScreenBaseStyles from "../screens/ScreenBaseStyles";
import ScreenRoutes from "../screens/ScreenRoutes";
import StoreChecks from "./StoreChecks";
import { ThermostatAction } from "../../generated/graphqlClient";
import { ThermostatNavigationParams } from "../screens/ThermostatSettingsScreen";
import { TouchableOpacity } from "react-native-gesture-handler";
import moment from "moment";
import { observer } from "mobx-react";

const styles = StyleSheet.create({
  // Primary row (e.g. "Sensor [temp] [hum]")
  primaryRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 30,
  },
  thermostatName: {
    fontSize: 18,
  },
  detailsText: {
    fontSize: 14,
    paddingRight: 5,
  },
  // Secondary row (e.g. "Last updated...")
  secondaryRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 14,
    marginBottom: 6,
  },
  lastUpdatedText: {
    fontSize: 14,
  },
});

const iconSizes = {
  default: 16,
  arrows: 14,
};

type ThermostatValue = LatestThermostatValue & { configuration: ThermostatConfiguration };

const ThermostatStatusTable: React.FunctionComponent<{
  navigation: NavigationScreenProp<NavigationRoute>;
  theme: Theme;
}> = ({ navigation, theme }): React.ReactElement => {
  const rootStore = useRootStore();

  const [latestRenderTime, setLatestRenderTime] = useState(new Date());

  const refreshStores = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rootStore.latestThermostatValuesStore.update();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rootStore.thermostatSettingsStore.update();
  };

  useEffect(() => {
    //
    // Use this.state.latestRenderTime to force a list re-render
    // every so often in order to update the "Last update a few seconds ago" strings
    // relative to actual/current time.
    //
    const intervalRefreshTimeSince = setInterval(() => setLatestRenderTime(new Date()), 10 * 1000);

    const intervalRefreshStores = setInterval(() => refreshStores(), 60 * 1000);

    return function cleanup(): void {
      clearInterval(intervalRefreshTimeSince);
      clearInterval(intervalRefreshStores);
    };
  });

  const latestThermostatValuesStore = rootStore.latestThermostatValuesStore;
  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

  // Project data
  const values = latestThermostatValuesStore.data
    .map(
      (value): ThermostatValue => {
        // Cast away findById() potentially returning unknown - we'll filter for it next
        return {
          ...value,
          configuration: thermostatConfigurationStore.findById(value.id) as ThermostatConfiguration,
        };
      }
    )
    .filter(
      // Only display devices for which we could find a configuration record
      value => value.configuration
    )
    .filter(
      value =>
        // Don't display devices that don't have available actions, i.e. aren't controlling thermostats
        // (may be reporting-only devices)
        value.configuration.availableActions && value.configuration.availableActions.length
    )
    .sort((lhs, rhs): number => lhs.configuration.name.localeCompare(rhs.configuration.name));

  return (
    <StoreChecks requiredStores={[latestThermostatValuesStore, thermostatConfigurationStore]}>
      <FlatList<ThermostatValue>
        data={values}
        extraData={latestRenderTime}
        keyExtractor={(item: ThermostatValue): string => item.id}
        onRefresh={refreshStores}
        refreshing={latestThermostatValuesStore.isWorking || thermostatConfigurationStore.isWorking}
        renderItem={({ item }): React.ReactElement => (
          <TouchableOpacity
            onPress={(): void => {
              const params: ThermostatNavigationParams = {
                thermostatId: item.id,
                thermostatName: item.configuration.name,
              };
              navigation.navigate(ScreenRoutes.ThermostatSettings, params);
            }}
            style={ScreenBaseStyles.topLevelView}
          >
            {/* Top row */}
            <View style={styles.primaryRow}>
              {/* Device name */}
              <Text style={styles.thermostatName}>{item.configuration.name}</Text>

              {/* Details */}
              <>
                {/* Thermometer icon */}
                <IconMDC color={theme.colors.accent} name="thermometer" size={iconSizes.default} />

                {/* Reported temperature */}
                <ThemedText.Accent style={styles.detailsText}>
                  {item.temperature}
                  &deg;C
                </ThemedText.Accent>

                {/* Actions: heat */}
                {item.currentActions.includes(ThermostatAction.Heat) && (
                  <IconMDC
                    color={ColorCodes[ThermostatAction.Heat]}
                    name={IconNames[ThermostatAction.Heat]}
                    size={iconSizes.arrows}
                  />
                )}
                {item.allowedActions.includes(ThermostatAction.Heat) && (
                  <ThemedText.Heat style={styles.detailsText}>
                    {item.setPointHeat}
                    &deg;C
                  </ThemedText.Heat>
                )}

                {/* Actions: cool */}
                {item.currentActions.includes(ThermostatAction.Cool) && (
                  <IconMDC
                    color={ColorCodes[ThermostatAction.Cool]}
                    name={IconNames[ThermostatAction.Cool]}
                    size={iconSizes.arrows}
                  />
                )}
                {item.allowedActions.includes(ThermostatAction.Cool) && (
                  <ThemedText.Cool style={styles.detailsText}>
                    {item.setPointCool}
                    &deg;C
                  </ThemedText.Cool>
                )}

                {/* Actions: circulate */}
                {item.currentActions.includes(ThermostatAction.Circulate) && (
                  <IconMDC
                    color={ColorCodes[ThermostatAction.Circulate]}
                    name={IconNames[ThermostatAction.Circulate]}
                    size={iconSizes.default}
                  />
                )}

                {/* Reported humidity */}
                <IconMDC color={theme.colors.accent} name="water" size={iconSizes.default} />
                <ThemedText.Accent style={styles.detailsText}>{item.humidity}%</ThemedText.Accent>
              </>
            </View>

            {/* Bottom row: last updated time */}
            <View style={styles.secondaryRow}>
              <ThemedText.Accent style={styles.lastUpdatedText}>
                Last updated {moment(item.deviceTime).from(latestRenderTime)}
              </ThemedText.Accent>
            </View>
          </TouchableOpacity>
        )}
      />
    </StoreChecks>
  );
};

export default withTheme(withNavigation(observer(ThermostatStatusTable)));
