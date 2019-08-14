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
  LatestValuesComponent,
  LatestValuesQuery,
  ThermostatAction,
} from "../../generated/graphqlClient";

import { ColorCodes } from "../Theme";
import * as ThemedText from "./ThemedText";

import ScreenRoutes from "../screens/ScreenRoutes";
import { ThermostatNavigationParams } from "../screens/ThermostatScreen";

gql`
  query LatestValues {
    getLatestActions {
      deviceId
      deviceTime
      currentActions
    }
    getLatestValues {
      sensorId
      temperature
      humidity
    }
    getThermostatConfigurations {
      deviceId
      name
      setPointCool
      setPointHeat
      allowedActions
    }
  }
`;

type LatestAction = ArrayElementType<PropType<LatestValuesQuery, "getLatestActions">>;
type LatestValue = ArrayElementType<PropType<LatestValuesQuery, "getLatestValues">>;
type LatestConfiguration = ArrayElementType<
  PropType<LatestValuesQuery, "getThermostatConfigurations">
>;

type ThermostatStatus = {
  action: LatestAction;
  value?: LatestValue;
  configuration?: LatestConfiguration;
};

const styles = StyleSheet.create({
  detailsPadding: {
    paddingLeft: 5,
  },
  detailsText: {
    fontSize: 14,
  },
  flexColumn: {
    flex: 1,
    flexDirection: "column",
  },
  flexRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  lastUpdatedText: {
    fontSize: 12,
  },
  nameText: {
    fontSize: 18,
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

  private prepareData(data: LatestValuesQuery): ThermostatStatus[] {
    // Rehydrate custom types
    data.getLatestActions.forEach((a): void => {
      a.deviceTime = new Date(a.deviceTime);
    });

    // Build maps
    const thermostatConfigurations = new Map(
      data.getThermostatConfigurations.map((c): [string, LatestConfiguration] => [c.deviceId, c])
    );

    const latestValues = new Map(
      data.getLatestValues.map((v): [string, LatestValue] => [v.sensorId, v])
    );

    // Assemble and sort data
    const thermostatStatusData = data.getLatestActions
      .map(
        (a): ThermostatStatus => ({
          action: a,
          value: latestValues.get(a.deviceId),
          configuration: thermostatConfigurations.get(a.deviceId),
        })
      )
      .sort(
        (lhs, rhs): number => rhs.action.deviceTime.getTime() - lhs.action.deviceTime.getTime()
      );

    return thermostatStatusData;
  }

  public render(): React.ReactElement {
    return (
      <LatestValuesComponent pollInterval={60 * 1000}>
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
              keyExtractor={(item): string => item.action.deviceId}
              refreshing={loading}
              onRefresh={() => refetch()}
              renderItem={({ item }): React.ReactElement => (
                <TouchableOpacity
                  onPress={() => {
                    const params: ThermostatNavigationParams = { deviceId: item.action.deviceId };
                    this.props.navigation.navigate(ScreenRoutes.Thermostat, params);
                  }}
                  style={{
                    ...styles.flexColumn,
                    paddingLeft: 20,
                    paddingBottom: 20,
                  }}
                >
                  {/* Top row */}
                  <View style={{ ...styles.flexRow, height: 30 }}>
                    {/* Device name */}
                    <Text style={styles.nameText}>
                      {item.configuration ? item.configuration.name : item.action.deviceId}
                    </Text>

                    {/* Details */}
                    <>
                      {/* Thermometer icon */}
                      <IconMDC
                        name="thermometer"
                        size={iconSizes.default}
                        color={this.props.theme.colors.accent}
                        style={{ paddingLeft: 5 }}
                      />

                      {/* Reported temperature */}
                      {item.value && (
                        <ThemedText.Accent style={styles.detailsText}>
                          {item.value.temperature}&deg;C
                        </ThemedText.Accent>
                      )}

                      {/* Actions: heat */}
                      {item.action.currentActions.includes(ThermostatAction.Heat) && (
                        <>
                          <IconMDC
                            name="arrow-collapse-up"
                            size={iconSizes.arrows}
                            color={ColorCodes[ThermostatAction.Heat]}
                            style={styles.detailsPadding}
                          />
                          {item.configuration && (
                            <ThemedText.Heat style={styles.detailsText}>
                              {item.configuration.setPointHeat} &deg;C
                            </ThemedText.Heat>
                          )}
                        </>
                      )}

                      {/* Actions: cool */}
                      {item.action.currentActions.includes(ThermostatAction.Cool) && (
                        <>
                          <IconMDC
                            name="arrow-collapse-down"
                            size={iconSizes.arrows}
                            color={ColorCodes[ThermostatAction.Cool]}
                            style={styles.detailsPadding}
                          />
                          {item.configuration && (
                            <ThemedText.Cool style={styles.detailsText}>
                              {item.configuration.setPointCool} &deg;C
                            </ThemedText.Cool>
                          )}
                        </>
                      )}

                      {/* Actions: circulate */}
                      {item.action.currentActions.includes(ThermostatAction.Circulate) && (
                        <IconMDC
                          name="autorenew"
                          size={iconSizes.default}
                          color={ColorCodes[ThermostatAction.Circulate]}
                          style={styles.detailsPadding}
                        />
                      )}

                      {/* Reported humidity */}
                      {item.value && item.value.humidity && (
                        <>
                          <IconMDC
                            name="water-percent"
                            size={iconSizes.default}
                            color={this.props.theme.colors.accent}
                            style={styles.detailsPadding}
                          />
                          <ThemedText.Accent style={styles.detailsText}>
                            {item.value.humidity}
                          </ThemedText.Accent>
                        </>
                      )}
                    </>
                  </View>

                  {/* Bottom row: last updated time */}
                  <View style={{ ...styles.flexRow, height: 10 }}>
                    <ThemedText.Accent style={styles.lastUpdatedText}>
                      Last updated{" "}
                      {moment(item.action.deviceTime).from(this.state.latestRenderTime)}
                    </ThemedText.Accent>
                  </View>
                </TouchableOpacity>
              )}
            />
          );
        }}
      </LatestValuesComponent>
    );
  }
}

export default withTheme(withNavigation(ThermostatStatusTable));
