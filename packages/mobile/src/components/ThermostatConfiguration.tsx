import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Checkbox, Text, Title, Theme, withTheme } from "react-native-paper";
import Slider from "@react-native-community/slider";

import gql from "graphql-tag";
import ApolloClient from "../services/ApolloClient";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import { PropType } from "../TypeTools";

import {
  UpdateThermostatConfigurationComponent,
  ThermostatAction,
  ThermostatConfigurationDocument,
  ThermostatConfigurationQuery,
  ThermostatConfigurationQueryVariables,
} from "../../generated/graphqlClient";

import { ColorCodes } from "../Theme";
import * as ThemedText from "./ThemedText";

gql`
  fragment ThermostatConfigurationFields on ThermostatConfiguration {
    deviceId
    name
    allowedActions
    setPointHeat
    setPointCool
  }

  query ThermostatConfiguration($deviceId: ID!) {
    getThermostatConfiguration(deviceId: $deviceId) {
      ...ThermostatConfigurationFields
    }
  }

  mutation UpdateThermostatConfiguration(
    $thermostatConfiguration: ThermostatConfigurationUpdateInput!
  ) {
    updateThermostatConfiguration(thermostatConfiguration: $thermostatConfiguration) {
      ...ThermostatConfigurationFields
    }
  }
`;

const styles = StyleSheet.create({
  flexColumn: {
    flex: 1,
    flexDirection: "column",
  },
  nameText: {
    fontSize: 20,
  },
  setPointRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  setPointText: {
    fontSize: 16,
  },
  slider: {
    height: 12,
    width: 200,
  },
});

interface Props {
  deviceId: string;
  theme: Theme;
}

class State {
  errors?: string;
  thermostatConfiguration?: PropType<ThermostatConfigurationQuery, "getThermostatConfiguration">;
}

class ThermostatConfiguration extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
  }

  async componentDidMount(): Promise<any> {
    try {
      const queryResult = await ApolloClient.query<
        ThermostatConfigurationQuery,
        ThermostatConfigurationQueryVariables
      >({
        query: ThermostatConfigurationDocument,
        variables: { deviceId: this.props.deviceId },
      });

      if (queryResult.errors) {
        this.setState({ errors: JSON.stringify(queryResult.errors) });
      }

      if (!queryResult.data) {
        this.setState({ errors: "No data returned" });
      }

      this.setState({ thermostatConfiguration: queryResult.data.getThermostatConfiguration });
    } catch (error) {
      this.setState({ errors: JSON.stringify(error) });
    }
  }

  private toggleAllowedAction(action: ThermostatAction): void {
    if (!this.state.thermostatConfiguration) {
      return;
    }

    let actions = this.state.thermostatConfiguration.allowedActions;

    if (actions.includes(action)) {
      actions = actions.filter(a => a != action);
    } else {
      actions.push(action);
    }

    this.setState({
      thermostatConfiguration: { ...this.state.thermostatConfiguration, allowedActions: actions },
    });
  }

  public render(): React.ReactElement {
    // Initializing
    if (!this.state) {
      return <ActivityIndicator animating={true} />;
    }

    // Errors
    if (this.state.errors) {
      return (
        <>
          <Title>Error</Title>
          <Text>{this.state.errors}</Text>
        </>
      );
    }

    // Loading
    if (!this.state.thermostatConfiguration) {
      return <ActivityIndicator animating={true} />;
    }

    // Component
    const thermostatConfiguration = this.state.thermostatConfiguration;

    return (
      <UpdateThermostatConfigurationComponent>
        {(_mutateFn): React.ReactElement => {
          return (
            <View style={{ ...styles.flexColumn, paddingLeft: 20 }}>
              {/* Name */}
              <Text style={styles.nameText}>{thermostatConfiguration.name}</Text>

              {/* Set point: Heat */}
              <View style={styles.setPointRow}>
                <Checkbox
                  status={
                    thermostatConfiguration.allowedActions.includes(ThermostatAction.Heat)
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={_event => this.toggleAllowedAction(ThermostatAction.Heat)}
                  color={ColorCodes[ThermostatAction.Heat]}
                />
                <Text style={styles.setPointText}>
                  <ThemedText.Heat>Heat</ThemedText.Heat> to {thermostatConfiguration.setPointHeat}{" "}
                  &deg;C
                </Text>
                <Slider
                  value={thermostatConfiguration.setPointHeat}
                  onValueChange={(value): void =>
                    this.setState({
                      thermostatConfiguration: {
                        ...thermostatConfiguration,
                        setPointHeat: value,
                      },
                    })
                  }
                  minimumValue={ThermostatConfigurationSchema.SetPointRange.min}
                  maximumValue={ThermostatConfigurationSchema.SetPointRange.max}
                  step={0.5}
                  minimumTrackTintColor={ColorCodes[ThermostatAction.Heat]}
                  thumbTintColor={ColorCodes[ThermostatAction.Heat]}
                  style={styles.slider}
                />
              </View>

              {/* Set point: Cool */}
              <View style={styles.setPointRow}>
                <Checkbox
                  status={
                    thermostatConfiguration.allowedActions.includes(ThermostatAction.Cool)
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={_event => this.toggleAllowedAction(ThermostatAction.Cool)}
                  color={ColorCodes[ThermostatAction.Cool]}
                />
                <Text style={styles.setPointText}>
                  <ThemedText.Cool>Cool</ThemedText.Cool> to {thermostatConfiguration.setPointCool}{" "}
                  &deg;C
                </Text>
                <Slider
                  value={thermostatConfiguration.setPointCool}
                  onValueChange={(value): void =>
                    this.setState({
                      thermostatConfiguration: {
                        ...thermostatConfiguration,
                        setPointCool: value,
                      },
                    })
                  }
                  minimumValue={ThermostatConfigurationSchema.SetPointRange.min}
                  maximumValue={ThermostatConfigurationSchema.SetPointRange.max}
                  step={0.5}
                  minimumTrackTintColor={ColorCodes[ThermostatAction.Cool]}
                  thumbTintColor={ColorCodes[ThermostatAction.Cool]}
                  style={styles.slider}
                />
              </View>

              {/* Set point: Circulate */}
              <View style={styles.setPointRow}>
                <Checkbox
                  status={
                    thermostatConfiguration.allowedActions.includes(ThermostatAction.Circulate)
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={_event => this.toggleAllowedAction(ThermostatAction.Circulate)}
                  color={ColorCodes[ThermostatAction.Circulate]}
                />
                <ThemedText.Circulate style={styles.setPointText}>Circulate</ThemedText.Circulate>
              </View>
            </View>
          );
        }}
      </UpdateThermostatConfigurationComponent>
    );
  }
}

export default withTheme(ThermostatConfiguration);
