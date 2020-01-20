import React, { useState } from "react";
import { Header, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";

import {
  useRootStore,
  ThermostatSettings,
  ThermostatSettingsHelpers,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import AddSettingPopup from "./thermostatSettings/AddSettingPopup";
import ThermostatSettingBean from "./thermostatSettings/ThermostatSettingBean";

const ThermostatSettingsComponent: React.FunctionComponent<{
  thermostatSettings: ThermostatSettings;
}> = ({ thermostatSettings }): React.ReactElement => {
  const rootStore = useRootStore();

  const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
    thermostatSettings.id
  );

  const [isSaving, setIsSaving] = useState(false);

  const mutableSettingsStore = new ThermostatSettingsHelpers.MutableSettingsStore(
    rootStore.thermostatSettingsStore,
    thermostatSettings,
    setIsSaving
  );

  return (
    <>
      <Header as="h3" attached="top">
        {thermostatConfiguration?.name || thermostatSettings.id}

        <AddSettingPopup
          mutableSettingsStore={mutableSettingsStore}
          defaultThermostatSetting={mutableSettingsStore.newHoldSettingTemplate}
          availableActions={thermostatConfiguration?.availableActions || []}
          isSaving={isSaving}
        />

        <AddSettingPopup
          mutableSettingsStore={mutableSettingsStore}
          defaultThermostatSetting={mutableSettingsStore.newScheduledSettingTemplate}
          availableActions={thermostatConfiguration?.availableActions || []}
          isSaving={isSaving}
        />
      </Header>
      <Segment attached>
        {mutableSettingsStore.orderedSettings.map((setting, index) => {
          return (
            <ThermostatSettingBean
              mutableSettingsStore={mutableSettingsStore}
              thermostatSetting={setting}
              availableActions={thermostatConfiguration?.availableActions || []}
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
              isSaving={isSaving}
            />
          );
        })}
      </Segment>
    </>
  );
};

export default observer(ThermostatSettingsComponent);
