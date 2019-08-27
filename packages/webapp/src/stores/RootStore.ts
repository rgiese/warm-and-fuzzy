import { ThermostatConfigurationStore } from "./stores";

export class RootStore {
  readonly thermostatConfigurationStore: ThermostatConfigurationStore;

  public constructor() {
    this.thermostatConfigurationStore = new ThermostatConfigurationStore();
  }
}
