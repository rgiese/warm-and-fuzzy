import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, Title, Theme, withTheme } from "react-native-paper";
//import Slider from "@react-native-community/slider";
import { TouchableOpacity } from "react-native-gesture-handler";
import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";

import gql from "graphql-tag";
import moment from "moment";

//import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import {
  DeviceAction,
  SensorValue,
  LatestValuesComponent,
  LatestValuesQuery,
  ThermostatAction,
  ThermostatConfiguration,
} from "../../generated/graphqlClient";

import * as ThemedText from "./ThemedText";

import { ColorCodes } from "../Theme";

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

type LatestSensorValue = Pick<SensorValue, "temperature" | "humidity">;
type LatestThermostatConfiguration = Pick<
  ThermostatConfiguration,
  "name" | "setPointCool" | "setPointHeat" | "allowedActions"
>;

type ThermostatStatus = {
  action: Pick<DeviceAction, "deviceId" | "deviceTime" | "currentActions">;
  value?: LatestSensorValue;
  configuration?: LatestThermostatConfiguration;
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

interface Props {
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

    data.getLatestValues.forEach((v): void => {
      v.deviceTime = new Date(v.deviceTime);
    });

    // Build maps
    const thermostatConfigurations = new Map(
      data.getThermostatConfigurations.map((c): [string, LatestThermostatConfiguration] => [
        c.deviceId,
        c,
      ])
    );

    const latestValues = new Map(
      data.getLatestValues.map((v): [string, LatestSensorValue] => [v.sensorId, v])
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

export default withTheme(ThermostatStatusTable);

/*
                            <List.Item
                              description="Heat set point"
                              left={(_props): React.ReactElement => (
                                <Switch
                                  value={thermostatConfiguration.allowedActions.includes(
                                    ThermostatAction.Heat
                                  )}
                                  color={ColorCodes[ThermostatAction.Heat]}
                                />
                              )}
                              title={
                                <>
                                  <Text>{thermostatConfiguration.setPointHeat} &deg;C</Text>
                                  <Slider
                                    value={thermostatConfiguration.setPointHeat}
                                    minimumValue={ThermostatConfigurationSchema.SetPointRange.min}
                                    maximumValue={ThermostatConfigurationSchema.SetPointRange.max}
                                    step={0.5}
                                    minimumTrackTintColor={ColorCodes[ThermostatAction.Heat]}
                                    thumbTintColor={ColorCodes[ThermostatAction.Heat]}
                                    style={{ width: 200, height: 12 }}
                                  />
                                </>
                              }
                            />

                            <List.Item
                              description="Cool set point"
                              left={(_props): React.ReactElement => (
                                <Switch
                                  value={thermostatConfiguration.allowedActions.includes(
                                    ThermostatAction.Cool
                                  )}
                                  color={ColorCodes[ThermostatAction.Cool]}
                                />
                              )}
                              title={
                                <>
                                  <Text>{thermostatConfiguration.setPointCool} &deg;C</Text>
                                  <Slider
                                    value={thermostatConfiguration.setPointCool}
                                    minimumValue={ThermostatConfigurationSchema.SetPointRange.min}
                                    maximumValue={ThermostatConfigurationSchema.SetPointRange.max}
                                    step={0.5}
                                    minimumTrackTintColor={ColorCodes[ThermostatAction.Cool]}
                                    thumbTintColor={ColorCodes[ThermostatAction.Cool]}
                                    style={{ width: 200, height: 12 }}
                                  />
                                </>
                              }
                            />

                            <List.Item
                              description="Force circulation"
                              left={(_props): React.ReactElement => (
                                <Switch
                                  value={thermostatConfiguration.allowedActions.includes(
                                    ThermostatAction.Circulate
                                  )}
                                  color={ColorCodes[ThermostatAction.Circulate]}
                                />
                              )}
                              title="Circulate"
                            />

*/
