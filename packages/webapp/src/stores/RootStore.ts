import {
  LatestThermostatValuesStore,
  SensorConfigurationStore,
  ThermostatConfigurationStore,
} from "./stores";

export class RootStore {
  readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  readonly sensorConfigurationStore: SensorConfigurationStore;
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor() {
    this.latestThermostatValuesStore = new LatestThermostatValuesStore();
    this.sensorConfigurationStore = new SensorConfigurationStore();
    this.thermostatConfigurationStore = new ThermostatConfigurationStore();
  }
}
