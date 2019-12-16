import {
  LatestSensorValuesStore,
  LatestThermostatValuesStore,
  SensorConfigurationStore,
  ThermostatConfigurationStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import ApolloClient from "../services/ApolloClient";

export class RootStore {
  readonly latestSensorValuesStore: LatestSensorValuesStore;
  readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  readonly sensorConfigurationStore: SensorConfigurationStore;
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor() {
    this.latestSensorValuesStore = new LatestSensorValuesStore(ApolloClient);
    this.latestThermostatValuesStore = new LatestThermostatValuesStore(ApolloClient);
    this.sensorConfigurationStore = new SensorConfigurationStore(ApolloClient);
    this.thermostatConfigurationStore = new ThermostatConfigurationStore(ApolloClient);
  }
}
