import React from "react";
import { ActivityIndicator, List, Switch, Text, Title, Theme, withTheme } from "react-native-paper";
import Slider from "@react-native-community/slider";

import gql from "graphql-tag";
import moment from "moment";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import {
  SensorValue,
  LatestValuesComponent,
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
      deviceTime
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

type LatestSensorValue = Pick<SensorValue, "sensorId" | "deviceTime" | "temperature" | "humidity">;
type LatestThermostatConfiguration = Pick<
  ThermostatConfiguration,
  "deviceId" | "name" | "setPointCool" | "setPointHeat" | "allowedActions"
>;

interface Props {
  theme: Theme;
}

class State {}

class ThermostatStatusTable extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public render(): React.ReactElement {
    return (
      <LatestValuesComponent>
        {({ loading, error, data }): React.ReactElement => {
          if (loading) {
            return <ActivityIndicator animating={true} />;
          }

          if (error || !data || !data.getLatestValues) {
            return (
              <>
                <Title>Error</Title>
                <Text>{JSON.stringify(error)}</Text>
              </>
            );
          }

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

          // Sort by date, descending
          const sortedActions = data.getLatestActions.sort(
            (lhs, rhs): number => rhs.deviceTime.getTime() - lhs.deviceTime.getTime()
          );

          return (
            <List.Section>
              {sortedActions.map(
                (latestAction): React.ReactElement => {
                  const thermostatConfiguration = thermostatConfigurations.get(
                    latestAction.deviceId
                  );
                  const latestValue = latestValues.get(latestAction.deviceId);

                  return (
                    <List.Accordion
                      key={latestAction.deviceId}
                      title={
                        <>
                          <Text>
                            {thermostatConfiguration
                              ? thermostatConfiguration.name
                              : latestAction.deviceId}{" "}
                          </Text>

                          <Text style={{ fontSize: 14 }}>
                            {latestValue && (
                              <ThemedText.Accent>
                                &#x1f321; {latestValue.temperature}&deg;C
                              </ThemedText.Accent>
                            )}
                            {latestAction.currentActions && (
                              <>
                                {latestAction.currentActions.includes(ThermostatAction.Heat) && (
                                  <ThemedText.Heat>
                                    <ThemedText.Heat style={{ fontWeight: "bold", fontSize: 18 }}>
                                      {" "}
                                      &#8599;
                                    </ThemedText.Heat>
                                    {thermostatConfiguration && (
                                      <>{thermostatConfiguration.setPointHeat} &deg;C</>
                                    )}
                                  </ThemedText.Heat>
                                )}
                                {latestAction.currentActions.includes(ThermostatAction.Cool) && (
                                  <ThemedText.Cool>
                                    <ThemedText.Cool style={{ fontWeight: "bold", fontSize: 18 }}>
                                      {" "}
                                      &#8600;
                                    </ThemedText.Cool>
                                    {thermostatConfiguration && (
                                      <>{thermostatConfiguration.setPointCool} &deg;C</>
                                    )}
                                  </ThemedText.Cool>
                                )}
                                {latestAction.currentActions.includes(
                                  ThermostatAction.Circulate
                                ) && (
                                  <ThemedText.Circulate
                                    style={{ fontWeight: "bold", fontSize: 18 }}
                                  >
                                    {" "}
                                    &#x267A;
                                  </ThemedText.Circulate>
                                )}
                              </>
                            )}
                            {latestValue && latestValue.humidity && (
                              <ThemedText.Accent>
                                {"  "}&#x1F4A7; {latestValue.humidity} RH
                              </ThemedText.Accent>
                            )}
                          </Text>
                        </>
                      }
                      description={
                        latestValue ? (
                          <ThemedText.Accent>
                            Last updated {moment(latestValue.deviceTime).fromNow()}
                          </ThemedText.Accent>
                        ) : null
                      }
                    >
                      {thermostatConfiguration && (
                        <>
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
                        </>
                      )}
                    </List.Accordion>
                  );
                }
              )}
            </List.Section>
          );
        }}
      </LatestValuesComponent>
    );
  }
}

export default withTheme(ThermostatStatusTable);
