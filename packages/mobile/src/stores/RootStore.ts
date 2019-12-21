import {
  AuthStore,
  LatestSensorValuesStore,
  LatestThermostatValuesStore,
  SensorConfigurationStore,
  ThermostatConfigurationStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import ApolloClient from "../services/ApolloClient";

export class RootStore {
  readonly authStore: AuthStore;
  readonly latestSensorValuesStore: LatestSensorValuesStore;
  readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  readonly sensorConfigurationStore: SensorConfigurationStore;
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor() {
    this.authStore = new AuthStore();

    this.latestSensorValuesStore = new LatestSensorValuesStore(this.authStore, ApolloClient);
    this.latestThermostatValuesStore = new LatestThermostatValuesStore(
      this.authStore,
      ApolloClient
    );
    this.sensorConfigurationStore = new SensorConfigurationStore(this.authStore, ApolloClient);
    this.thermostatConfigurationStore = new ThermostatConfigurationStore(
      this.authStore,
      ApolloClient
    );
  }
}
