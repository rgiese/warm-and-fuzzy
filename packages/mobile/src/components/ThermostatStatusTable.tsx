import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, Title, Theme, withTheme } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import gql from "graphql-tag";
import moment from "moment";

import { ArrayElementType, PropType } from "../TypeTools";

import {
  LatestThermostatValuesComponent,
  LatestThermostatValuesQuery,
  ThermostatAction,
} from "../../generated/graphqlClient";

import { ColorCodes } from "../Theme";
import * as ThemedText from "./ThemedText";

import ScreenRoutes from "../screens/ScreenRoutes";
import { ThermostatNavigationParams } from "../screens/ThermostatScreen";

gql`
  query LatestThermostatValues {
    getLatestThermostatValues {
      id
      deviceTime
      currentActions
      temperature
      humidity
    }
    getThermostatConfigurations {
      id
      name
      setPointCool
      setPointHeat
      allowedActions
    }
  }
`;

type LatestThermostatValue = ArrayElementType<
  PropType<LatestThermostatValuesQuery, "getLatestThermostatValues">
>;
type CurrentThermostatConfiguration = ArrayElementType<
  PropType<LatestThermostatValuesQuery, "getThermostatConfigurations">
>;

type ThermostatStatus = LatestThermostatValue & {
  configuration: CurrentThermostatConfiguration;
};

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
  latestRenderTime: Date;

  constructor() {
    this.latestRenderTime = new Date();
  }
}

class ThermostatStatusTable extends React.Component<Props, State> {
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

  private prepareData(data: LatestThermostatValuesQuery): ThermostatStatus[] {
    // Rehydrate custom types
    data.getLatestThermostatValues.forEach((a): void => {
      a.deviceTime = new Date(a.deviceTime);
    });

    // Build maps
    const thermostatConfigurations = new Map(
      data.getThermostatConfigurations.map((c): [string, CurrentThermostatConfiguration] => [
        c.id,
        c,
      ])
    );

    // Assemble and sort data
    let thermostatStatusData: ThermostatStatus[] = [];

    data.getLatestThermostatValues.forEach((v): void => {
      const configuration = thermostatConfigurations.get(v.id);

      if (!configuration) {
        return;
      }

      thermostatStatusData.push(
        Object.assign({}, v, {
          configuration,
        })
      );
    });

    thermostatStatusData = thermostatStatusData.sort(
      (lhs, rhs): number => rhs.deviceTime.getTime() - lhs.deviceTime.getTime()
    );

    return thermostatStatusData;
  }

  public render(): React.ReactElement {
    return (
      <LatestThermostatValuesComponent pollInterval={60 * 1000}>
        {({ loading, error, data, refetch }): React.ReactElement => {
          if (error) {
            return (
              <>
                <Title>Error</Title>
                <Text>{JSON.stringify(error)}</Text>
              </>
            );
          }

          if (loading) {
            if (this.isFirstFetch) {
              return <ActivityIndicator animating={true} />;
            }
          } else {
            // We've succeeded at (at least) our first fetch so don't show the ActivityIndicator again
            this.isFirstFetch = false;
          }

          const thermostatStatusData = data
            ? this.prepareData(data)
            : new Array<ThermostatStatus>();

          return (
            <FlatList<ThermostatStatus>
              data={thermostatStatusData}
              extraData={this.state.latestRenderTime}
              keyExtractor={(item): string => item.id}
              refreshing={loading}
              onRefresh={() => refetch()}
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
                      <ThemedText.Accent style={styles.detailsText}>
                        {item.humidity}%
                      </ThemedText.Accent>
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
          );
        }}
      </LatestThermostatValuesComponent>
    );
  }
}

export default withTheme(withNavigation(ThermostatStatusTable));
