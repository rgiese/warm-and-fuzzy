import React from "react";
import { Alert, View, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  Switch,
  Text,
  Title,
  Theme,
  withTheme,
} from "react-native-paper";
import Slider from "@react-native-community/slider";

import gql from "graphql-tag";
import ApolloClient from "../services/ApolloClient";
import fastCompare from "react-fast-compare";

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
  // One row per set point
  setPointRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  // Left column: text
  setPointText: {
    flex: 2,
    fontSize: 16,
  },
  // Center column: slider
  setPointSlider: {
    flex: 3,
    height: 12,
    width: 100,
  },
  // Right column: switch
  setPointSwitch: {
    flex: 1,
  },
  // Final row
  saveButtonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 16,
  },
});

interface Props {
  deviceId: string;
  theme: Theme;
}

class State {
  errors?: string;
  thermostatConfiguration?: PropType<ThermostatConfigurationQuery, "getThermostatConfiguration">;

  savedThermostatConfiguration?: PropType<
    ThermostatConfigurationQuery,
    "getThermostatConfiguration"
  >;

  isSaving: boolean;

  constructor() {
    this.isSaving = false;
  }
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
        fetchPolicy: "network-only",
      });

      if (queryResult.errors) {
        this.setState({ errors: JSON.stringify(queryResult.errors) });
      }

      if (!queryResult.data) {
        this.setState({ errors: "No data returned" });
      }

      let thermostatConfiguration = queryResult.data.getThermostatConfiguration;

      // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
      delete thermostatConfiguration.__typename;

      this.setState({
        thermostatConfiguration,
        savedThermostatConfiguration: thermostatConfiguration,
      });
    } catch (error) {
      this.setState({ errors: JSON.stringify(error) });
    }
  }

  private updateAllowedAction(action: ThermostatAction, allowed: boolean): void {
    if (!this.state.thermostatConfiguration) {
      return;
    }

    let actions = this.state.thermostatConfiguration.allowedActions.filter(a => a !== action);

    if (allowed) {
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
        {(mutateFn): React.ReactElement => {
          return (
            <View style={styles.componentView}>
              {/* Name */}
              <Text style={styles.thermostatLabel}>{thermostatConfiguration.name}</Text>

              {/* Set point: Heat */}
              <View style={styles.setPointRow}>
                <Text style={styles.setPointText}>
                  <ThemedText.Heat>Heat</ThemedText.Heat> to {thermostatConfiguration.setPointHeat}{" "}
                  &deg;C
                </Text>
                <Slider
                  style={styles.setPointSlider}
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
                  step={1}
                  minimumTrackTintColor={ColorCodes[ThermostatAction.Heat]}
                  maximumTrackTintColor={ColorCodes[ThermostatAction.Heat]}
                  thumbTintColor={ColorCodes[ThermostatAction.Heat]}
                />
                <Switch
                  style={styles.setPointSwitch}
                  value={thermostatConfiguration.allowedActions.includes(ThermostatAction.Heat)}
                  onValueChange={value => this.updateAllowedAction(ThermostatAction.Heat, value)}
                  color={ColorCodes[ThermostatAction.Heat]}
                />
              </View>

              {/* Set point: Cool */}
              <View style={styles.setPointRow}>
                <Text style={styles.setPointText}>
                  <ThemedText.Cool>Cool</ThemedText.Cool> to {thermostatConfiguration.setPointCool}{" "}
                  &deg;C
                </Text>
                <Slider
                  style={styles.setPointSlider}
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
                  step={1}
                  minimumTrackTintColor={ColorCodes[ThermostatAction.Cool]}
                  maximumTrackTintColor={ColorCodes[ThermostatAction.Cool]}
                  thumbTintColor={ColorCodes[ThermostatAction.Cool]}
                />
                <Switch
                  style={styles.setPointSwitch}
                  value={thermostatConfiguration.allowedActions.includes(ThermostatAction.Cool)}
                  onValueChange={value => this.updateAllowedAction(ThermostatAction.Cool, value)}
                  color={ColorCodes[ThermostatAction.Cool]}
                />
              </View>

              {/* Set point: Circulate */}
              <View style={styles.setPointRow}>
                <ThemedText.Circulate style={styles.setPointText}>Circulate</ThemedText.Circulate>
                <View style={styles.setPointSlider}>{/* Empty */}</View>
                <Switch
                  style={styles.setPointSwitch}
                  value={thermostatConfiguration.allowedActions.includes(
                    ThermostatAction.Circulate
                  )}
                  onValueChange={value =>
                    this.updateAllowedAction(ThermostatAction.Circulate, value)
                  }
                  color={ColorCodes[ThermostatAction.Circulate]}
                />
              </View>

              {/* Save button */}
              <View style={styles.saveButtonRow}>
                <Button
                  mode="outlined"
                  disabled={fastCompare(
                    this.state.thermostatConfiguration,
                    this.state.savedThermostatConfiguration
                  )}
                  loading={this.state.isSaving}
                  color={this.props.theme.colors.text}
                  onPress={async (): Promise<void> => {
                    // Null check for TypeScript happiness
                    if (this.state.thermostatConfiguration) {
                      this.setState({ isSaving: true });

                      try {
                        await mutateFn({
                          variables: {
                            thermostatConfiguration: this.state.thermostatConfiguration,
                          },
                        });
                      } catch (error) {
                        Alert.alert("Couldn't update", JSON.stringify(error), [
                          { text: "Well then", style: "cancel" },
                        ]);
                      }

                      this.setState({
                        isSaving: false,
                        savedThermostatConfiguration: this.state.thermostatConfiguration,
                      });
                    }
                  }}
                >
                  {this.state.isSaving ? "Saving" : "Save"}
                </Button>
              </View>
            </View>
          );
        }}
      </UpdateThermostatConfigurationComponent>
    );
  }
}

export default withTheme(ThermostatConfiguration);
