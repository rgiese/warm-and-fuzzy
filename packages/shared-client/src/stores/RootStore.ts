import { ApolloClient } from "../services/ApolloClient";

import { AuthStore } from "./auth";
import { LatestSensorValuesStore } from "./latestSensorValues";
import { LatestThermostatValuesStore } from "./latestThermostatValues";
import { SensorConfigurationStore } from "./sensorConfiguration";
import { ThermostatConfigurationStore } from "./thermostatConfiguration";

export class RootStore {
  readonly authStore: AuthStore;
  readonly latestSensorValuesStore: LatestSensorValuesStore;
  readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  readonly sensorConfigurationStore: SensorConfigurationStore;
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor(authStore: AuthStore, apolloClient: ApolloClient) {
    this.authStore = authStore;

    this.latestSensorValuesStore = new LatestSensorValuesStore(this.authStore, apolloClient);
    this.latestThermostatValuesStore = new LatestThermostatValuesStore(
      this.authStore,
      apolloClient
    );
    this.sensorConfigurationStore = new SensorConfigurationStore(this.authStore, apolloClient);
    this.thermostatConfigurationStore = new ThermostatConfigurationStore(
      this.authStore,
      apolloClient
    );
  }
}
