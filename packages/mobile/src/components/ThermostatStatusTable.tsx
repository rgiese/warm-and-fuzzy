import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { Text, Theme, withTheme } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import { observer } from "mobx-react";
import moment from "moment";

import {
  LatestThermostatValue,
  ThermostatConfiguration,
  RootStoreContext,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "./StoreChecks";

import { ThermostatAction } from "../../generated/graphqlClient";

import { ColorCodes } from "../Theme";
import * as ThemedText from "./ThemedText";

import ScreenRoutes from "../screens/ScreenRoutes";
import { ThermostatNavigationParams } from "../screens/ThermostatScreen";

const styles = StyleSheet.create({
  containingListItem: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 20,
    paddingBottom: 20,
  },
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
  detailsIconPadding: {
    paddingLeft: 5,
  },
  detailsText: {
    fontSize: 14,
  },
  // Secondary row (e.g. "Last updated...")
  secondaryRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 10,
  },
  lastUpdatedText: {
    fontSize: 12,
  },
});

const iconSizes = {
  default: 16,
  arrows: 14,
};

interface Props extends NavigationInjectedProps {
  theme: Theme;
}

class State {
  latestRenderTime: Date = new Date();
}

type ThermostatValue = LatestThermostatValue & { configuration: ThermostatConfiguration };

class ThermostatStatusTable extends React.Component<Props, State> {
  static contextType = RootStoreContext;
  context!: React.ContextType<typeof RootStoreContext>;

  private intervalRefreshTimeSince: any;
  private isFirstFetch: boolean;

  public constructor(props: Props) {
    super(props);

    this.state = new State();
    this.isFirstFetch = true;
  }

  componentDidMount(): void {
    //
    // Use this.state.latestRenderTime to force a list re-render
    // every so often in order to update the "Last update a few seconds ago" strings
    // relative to actual/current time.
    //
    this.intervalRefreshTimeSince = setInterval(() => {
      this.setState({ latestRenderTime: new Date() });
    }, 10 * 1000);
  }

  componentWillUnmount(): void {
    clearInterval(this.intervalRefreshTimeSince);
  }

  public render(): React.ReactElement {
    // TODO: Polling
    const rootStore = this.context.rootStore;

    const latestThermostatValuesStore = rootStore.latestThermostatValuesStore;
    const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

    // TODO: suppress loading indicator on !this.isFirstFetch
    this.isFirstFetch = false;

    // Project data
    const values = latestThermostatValuesStore.data
      .map(
        (value): ThermostatValue => {
          // Cast away findById() potentially returning unknown - we'll filter for it next
          return {
            ...value,
            configuration: thermostatConfigurationStore.findById(
              value.id
            ) as ThermostatConfiguration,
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
          extraData={this.state.latestRenderTime}
          keyExtractor={(item): string => item.id}
          //refreshing={loading} // TODO
          //onRefresh={() => refetch()} // TODO
          renderItem={({ item }): React.ReactElement => (
            <TouchableOpacity
              onPress={() => {
                const params: ThermostatNavigationParams = { thermostatId: item.id };
                this.props.navigation.navigate(ScreenRoutes.Thermostat, params);
              }}
              style={styles.containingListItem}
            >
              {/* Top row */}
              <View style={styles.primaryRow}>
                {/* Device name */}
                <Text style={styles.thermostatName}>{item.configuration.name}</Text>

                {/* Details */}
                <>
                  {/* Thermometer icon */}
                  <IconMDC
                    name="thermometer"
                    size={iconSizes.default}
                    color={this.props.theme.colors.accent}
                    style={styles.detailsIconPadding}
                  />

                  {/* Reported temperature */}
                  <ThemedText.Accent style={styles.detailsText}>
                    {item.temperature}&deg;C
                  </ThemedText.Accent>

                  {/* Actions: heat */}
                  {item.currentActions.includes(ThermostatAction.Heat) && (
                    <>
                      <IconMDC
                        name="arrow-collapse-up"
                        size={iconSizes.arrows}
                        color={ColorCodes[ThermostatAction.Heat]}
                        style={styles.detailsIconPadding}
                      />
                      <ThemedText.Heat style={styles.detailsText}>
                        {item.configuration.setPointHeat} &deg;C
                      </ThemedText.Heat>
                    </>
                  )}

                  {/* Actions: cool */}
                  {item.currentActions.includes(ThermostatAction.Cool) && (
                    <>
                      <IconMDC
                        name="arrow-collapse-down"
                        size={iconSizes.arrows}
                        color={ColorCodes[ThermostatAction.Cool]}
                        style={styles.detailsIconPadding}
                      />
                      <ThemedText.Cool style={styles.detailsText}>
                        {item.configuration.setPointCool} &deg;C
                      </ThemedText.Cool>
                    </>
                  )}

                  {/* Actions: circulate */}
                  {item.currentActions.includes(ThermostatAction.Circulate) && (
                    <IconMDC
                      name="autorenew"
                      size={iconSizes.default}
                      color={ColorCodes[ThermostatAction.Circulate]}
                      style={styles.detailsIconPadding}
                    />
                  )}

                  {/* Reported humidity */}
                  <IconMDC
                    name="water"
                    size={iconSizes.default}
                    color={this.props.theme.colors.accent}
                    style={styles.detailsIconPadding}
                  />
                  <ThemedText.Accent style={styles.detailsText}>{item.humidity}%</ThemedText.Accent>
                </>
              </View>

              {/* Bottom row: last updated time */}
              <View style={styles.secondaryRow}>
                <ThemedText.Accent style={styles.lastUpdatedText}>
                  Last updated {moment(item.deviceTime).from(this.state.latestRenderTime)}
                </ThemedText.Accent>
              </View>
            </TouchableOpacity>
          )}
        />
      </StoreChecks>
    );
  }
}

export default withTheme(withNavigation(observer(ThermostatStatusTable)));
