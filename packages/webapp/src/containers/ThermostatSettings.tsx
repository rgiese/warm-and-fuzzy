import React from "react";
import { observer } from "mobx-react";

import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "../components/StoreChecks";
import ThermostatSettings from "../components/ThermostatSettings";

const ThermostatSettingsContainer: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useRootStore();

  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;
  const thermostatSettingsStore = rootStore.thermostatSettingsStore;

  const sortedThermostatSettings = thermostatSettingsStore.data.sort((lhs, rhs): number => {
    const lhsConfiguration = thermostatConfigurationStore.findById(lhs.id);
    const rhsConfiguration = thermostatConfigurationStore.findById(rhs.id);

    if (!lhsConfiguration) {
      return rhsConfiguration ? -1 : 0;
    }

    return lhsConfiguration.name.localeCompare(rhsConfiguration?.name || "");
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
