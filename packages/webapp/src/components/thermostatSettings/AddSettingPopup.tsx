import React, { useState } from "react";
import { Button, Popup } from "semantic-ui-react";

import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import ThermostatSettingBean from "./ThermostatSettingBean";

const AddSettingPopup: React.FunctionComponent<{
  mutableSettingsStore: ThermostatSettingsHelpers.MutableSettingsStore;
  defaultThermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
  isSaving: boolean;
}> = ({
  mutableSettingsStore,
  defaultThermostatSetting,
  availableActions,
  isSaving,
}): React.ReactElement => {
  // Control popup state so that clicks into nested popups don't dismiss it
  const [isPopupOpen, setPopupOpen] = useState(false);

  return (
    <Popup
      position="top center"
      wide="very"
      on="click"
      open={isPopupOpen}
      onOpen={() => setPopupOpen(true)}
      trigger={
        <Button
          style={{ marginLeft: 10, marginRight: 10 }}
          icon={
            defaultThermostatSetting.type === GraphQL.ThermostatSettingType.Hold ? "pause" : "play"
          }
          basic
          size="small"
          content={
            defaultThermostatSetting.type === GraphQL.ThermostatSettingType.Hold
              ? "Add hold"
              : "Add schedule step"
          }
        />
      }
    >
      <Popup.Content>
        <ThermostatSettingBean
          mutableSettingsStore={mutableSettingsStore}
          thermostatSetting={defaultThermostatSetting}
          availableActions={availableActions}
          allowRemove={false}
          isDirty={true}
          isSaving={isSaving}
          onAfterRevert={() => setPopupOpen(false)}
          onAfterSave={() => setPopupOpen(false)}
        />
      </Popup.Content>
    </Popup>
  );
};

export default AddSettingPopup;
