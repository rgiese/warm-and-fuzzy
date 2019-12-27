import React, { useState } from "react";
import { Button, Popup } from "semantic-ui-react";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../generated/graphqlClient";

import ThermostatSettingBean from "./ThermostatSettingBean";
import OnSave from "./OnSave";
import IndexedThermostatSetting from "./IndexedThermostatSetting";

const AddSettingPopup: React.FunctionComponent<{
  type: GraphQL.ThermostatSettingType;
  availableActions: GraphQL.ThermostatAction[];
  onSave: OnSave;
  isSaving: boolean;
}> = ({ type, availableActions, onSave, isSaving }): React.ReactElement => {
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
          icon={type === GraphQL.ThermostatSettingType.Hold ? "pause" : "play"}
          basic
          size="small"
          content={type === GraphQL.ThermostatSettingType.Hold ? "Add hold" : "Add schedule step"}
        />
      }
    >
      <Popup.Content>
        <ThermostatSettingBean
          thermostatSetting={{
            type,
            index: -1,
            // Hold settings
            holdUntil: new Date(0),
            // Scheduled settings
            atMinutesSinceMidnight: 0,
            daysOfWeek:
              type === GraphQL.ThermostatSettingType.Scheduled
                ? ThermostatSettingSchema.DaysOfWeek
                : [],
            // For all types
            allowedActions: [],
            setPointHeat: 18,
            setPointCool: 22,
          }}
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
