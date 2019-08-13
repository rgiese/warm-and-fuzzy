import React from "react";
import { ActivityIndicator, DataTable, Text, Title, Theme, withTheme } from "react-native-paper";
import gql from "graphql-tag";

import {
  SensorValue,
  LatestValuesComponent,
  ThermostatAction,
  ThermostatConfiguration,
} from "../../generated/graphqlClient";

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

  private renderSetPoints = (
    thermostatConfiguration: LatestThermostatConfiguration
  ): React.ReactElement => {
    const allowedActions = thermostatConfiguration.allowedActions;

    if (allowedActions.includes(ThermostatAction.Cool)) {
      return (
        <Text style={{ color: ColorCodes[ThermostatAction.Cool] }}>
          {thermostatConfiguration.setPointCool}&deg;C
        </Text>
      );
    } else if (allowedActions.includes(ThermostatAction.Heat)) {
      return (
        <Text style={{ color: ColorCodes[ThermostatAction.Heat] }}>
          {thermostatConfiguration.setPointHeat}&deg;C
        </Text>
      );
    }

    return <></>;
  };
  private renderCurrentActions = (actions: ThermostatAction[]): React.ReactElement => {
    if (actions.includes(ThermostatAction.Cool) && actions.includes(ThermostatAction.Heat)) {
      return <Text>Error</Text>;
    }

    if (actions.includes(ThermostatAction.Cool)) {
      return <Text style={{ color: ColorCodes[ThermostatAction.Cool] }}>Cool</Text>;
    } else if (actions.includes(ThermostatAction.Heat)) {
      return <Text style={{ color: ColorCodes[ThermostatAction.Heat] }}>Heat</Text>;
    }

    return <></>;
  };

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
            <DataTable>
              <DataTable.Header>
                {/* eslint-disable react-native/no-raw-text */}
                <DataTable.Title>Thermostat</DataTable.Title>
                <DataTable.Title>Setpoint</DataTable.Title>
                <DataTable.Title>Action</DataTable.Title>
                <DataTable.Title numeric>Temperature</DataTable.Title>
                <DataTable.Title numeric>Humidity</DataTable.Title>
                {/* eslint-enable react-native/no-raw-text */}
              </DataTable.Header>
              {sortedActions.map(
                (latestAction): React.ReactElement => {
                  const thermostatConfiguration = thermostatConfigurations.get(
                    latestAction.deviceId
                  );
                  const latestValue = latestValues.get(latestAction.deviceId);

                  return (
                    <DataTable.Row key={latestAction.deviceId}>
                      <DataTable.Cell>
                        {thermostatConfiguration
                          ? thermostatConfiguration.name
                          : latestAction.deviceId}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        {thermostatConfiguration && this.renderSetPoints(thermostatConfiguration)}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        {this.renderCurrentActions(latestAction.currentActions)}
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        {latestValue && (
                          <>
                            {latestValue.temperature}
                            <Text style={{ color: this.props.theme.colors.accent }}>&deg;C</Text>
                          </>
                        )}
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        {latestValue && latestValue.humidity && (
                          <>
                            {latestValue.humidity}
                            <Text style={{ color: this.props.theme.colors.accent }}>%</Text>
                          </>
                        )}
                      </DataTable.Cell>
                    </DataTable.Row>
                  );
                }
              )}
            </DataTable>
          );
        }}
      </LatestValuesComponent>
    );
  }
}

export default withTheme(ThermostatStatusTable);
