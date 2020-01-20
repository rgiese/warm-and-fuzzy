import * as GraphQL from "../../generated/graphqlClient";

import { Button, Popup } from "semantic-ui-react";
import React, { useState } from "react";

import ThermostatSettingBean from "./ThermostatSettingBean";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

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
      on="click"
      onOpen={(): void => setPopupOpen(true)}
      open={isPopupOpen}
      position="top center"
      trigger={
        <Button
          basic
          content={
            defaultThermostatSetting.type === GraphQL.ThermostatSettingType.Hold
              ? "Add hold"
              : "Add schedule step"
          }
          icon={
            defaultThermostatSetting.type === GraphQL.ThermostatSettingType.Hold ? "pause" : "play"
          }
          size="small"
          style={{ marginLeft: 10, marginRight: 10 }}
        />
      }
      wide="very"
    >
      <Popup.Content>
        <ThermostatSettingBean
          availableActions={availableActions}
          isNewSetting
          isSaving={isSaving}
          mutableSettingsStore={mutableSettingsStore}
          onAfterRevert={(): void => setPopupOpen(false)}
          onAfterSave={(): void => setPopupOpen(false)}
          thermostatSetting={defaultThermostatSetting}
        />
      </Popup.Content>
    </Popup>
  );
};

export default AddSettingPopup;
