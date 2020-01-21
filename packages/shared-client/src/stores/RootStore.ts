import { ApolloClient } from "../services/ApolloClient";
import { AuthStore } from "./auth";
import { LatestSensorValuesStore } from "./latestSensorValues";
import { LatestThermostatValuesStore } from "./latestThermostatValues";
import { SensorConfigurationStore } from "./sensorConfiguration";
import { ThermostatConfigurationStore } from "./thermostatConfiguration";
import { ThermostatSettingsStore } from "./thermostatSettings";

export class RootStore {
  public readonly authStore: AuthStore;
  public readonly latestSensorValuesStore: LatestSensorValuesStore;
  public readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  public readonly sensorConfigurationStore: SensorConfigurationStore;
  public readonly thermostatConfigurationStore: ThermostatConfigurationStore;
  public readonly thermostatSettingsStore: ThermostatSettingsStore;

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
    this.thermostatSettingsStore = new ThermostatSettingsStore(this.authStore, apolloClient);
  }
}
