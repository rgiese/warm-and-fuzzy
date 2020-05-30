import { Header, Segment } from "semantic-ui-react";
import React, { useState } from "react";
import {
  ThermostatSettings,
  ThermostatSettingsHelpers,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import AddSettingPopup from "./thermostatSettings/AddSettingPopup";
import ThermostatSettingBean from "./thermostatSettings/ThermostatSettingBean";
import { observer } from "mobx-react";

function ThermostatSettingsComponent({
  thermostatSettings,
}: {
  thermostatSettings: ThermostatSettings;
}): React.ReactElement {
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
        {thermostatConfiguration?.name ?? thermostatSettings.id}

        <AddSettingPopup
          availableActions={thermostatConfiguration?.availableActions ?? []}
          defaultThermostatSetting={mutableSettingsStore.newHoldSettingTemplate}
          isSaving={isSaving}
          mutableSettingsStore={mutableSettingsStore}
        />

        <AddSettingPopup
          availableActions={thermostatConfiguration?.availableActions ?? []}
          defaultThermostatSetting={mutableSettingsStore.newScheduledSettingTemplate}
          isSaving={isSaving}
          mutableSettingsStore={mutableSettingsStore}
        />
      </Header>
      <Segment attached>
        {mutableSettingsStore.orderedSettings.map((setting, index) => {
          return (
            <ThermostatSettingBean
              availableActions={thermostatConfiguration?.availableActions ?? []}
              isSaving={isSaving}
              // eslint-disable-next-line react/no-array-index-key
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
              mutableSettingsStore={mutableSettingsStore}
              thermostatSetting={setting}
            />
          );
        })}
      </Segment>
    </>
  );
}

export default observer(ThermostatSettingsComponent);
