import {
  LatestSensorValuesStore,
  LatestThermostatValuesStore,
  SensorConfigurationStore,
  ThermostatConfigurationStore,
} from "./stores";

export class RootStore {
  readonly latestSensorValuesStore: LatestSensorValuesStore;
  readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  readonly sensorConfigurationStore: SensorConfigurationStore;
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor() {
    this.latestSensorValuesStore = new LatestSensorValuesStore();
    this.latestThermostatValuesStore = new LatestThermostatValuesStore();
    this.sensorConfigurationStore = new SensorConfigurationStore();
    this.thermostatConfigurationStore = new ThermostatConfigurationStore();
  }
}
