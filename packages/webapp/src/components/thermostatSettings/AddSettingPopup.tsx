import React, { useState } from "react";
import { Button, Popup } from "semantic-ui-react";

import * as GraphQL from "../../generated/graphqlClient";

import ThermostatSettingBean from "./ThermostatSettingBean";
import OnSave from "./OnSave";
import IndexedThermostatSetting from "./IndexedThermostatSetting";

const AddSettingPopup: React.FunctionComponent<{
  defaultThermostatSetting: IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
  onSave: OnSave;
  isSaving: boolean;
}> = ({ defaultThermostatSetting, availableActions, onSave, isSaving }): React.ReactElement => {
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
          thermostatSetting={defaultThermostatSetting}
          availableActions={availableActions}
          onSave={async (updatedThermostatSetting: IndexedThermostatSetting): Promise<void> => {
            await onSave(updatedThermostatSetting);
            setPopupOpen(false);
          }}
          isSaving={isSaving}
          onAfterRevert={() => setPopupOpen(false)}
        />
      </Popup.Content>
    </Popup>
  );
};

export default AddSettingPopup;
