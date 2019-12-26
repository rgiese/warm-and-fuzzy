import React, { useContext } from "react";
import { observer } from "mobx-react";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "../components/StoreChecks";
import ThermostatSettings from "../components/ThermostatSettings";

const ThermostatSettingsContainer: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  return (
    <StoreChecks
      requiredStores={[rootStore.thermostatConfigurationStore, rootStore.thermostatSettingsStore]}
    >
      {rootStore.thermostatSettingsStore.data.map(thermostatSettings => (
        <ThermostatSettings key={thermostatSettings.id} thermostatSettings={thermostatSettings} />
      ))}
    </StoreChecks>
  );
};

export default observer(ThermostatSettingsContainer);
