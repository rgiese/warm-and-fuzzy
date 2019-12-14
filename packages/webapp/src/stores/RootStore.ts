import { LatestThermostatValuesStore, ThermostatConfigurationStore } from "./stores";

export class RootStore {
  readonly latestThermostatValuesStore: LatestThermostatValuesStore;
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor() {
    this.latestThermostatValuesStore = new LatestThermostatValuesStore();
    this.thermostatConfigurationStore = new ThermostatConfigurationStore();
  }
}
