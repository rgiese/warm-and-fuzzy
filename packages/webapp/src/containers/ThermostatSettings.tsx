import React from "react";
import StoreChecks from "../components/StoreChecks";
import ThermostatSettings from "../components/ThermostatSettings";
import { observer } from "mobx-react";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

const ThermostatSettingsContainer: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();

  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;
  const thermostatSettingsStore = rootStore.thermostatSettingsStore;

  // Looking up the configuration a whole bunch below may be a bit clowny
  // but these are small datasets and this is less complex than any alternative.
  const sortedThermostatSettings = thermostatSettingsStore.data
    .filter((thermostatSettings): boolean => {
      const configuration = thermostatConfigurationStore.findById(thermostatSettings.id);

      // We need a configuration (e.g. for name)
      if (!configuration) {
        return false;
      }

      // Don't display reporting-only devices, i.e. those that have no available actions
      if (!configuration.availableActions || !configuration.availableActions.length) {
        return false;
      }

      return true;
    })
    .sort((lhs, rhs): number => {
      const lhsConfiguration = thermostatConfigurationStore.findById(lhs.id);
      const rhsConfiguration = thermostatConfigurationStore.findById(rhs.id);

      if (!lhsConfiguration || !rhsConfiguration) {
        throw new Error("Filter step should have eliminated missing configurations");
      }

      return lhsConfiguration.name.localeCompare(rhsConfiguration.name ?? "");
    });

  return (
    <StoreChecks
      requiredStores={[rootStore.thermostatConfigurationStore, rootStore.thermostatSettingsStore]}
    >
      {sortedThermostatSettings.map(thermostatSettings => (
        <ThermostatSettings key={thermostatSettings.id} thermostatSettings={thermostatSettings} />
      ))}
    </StoreChecks>
  );
};

export default observer(ThermostatSettingsContainer);
