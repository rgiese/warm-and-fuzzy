import React, { useState } from "react";
import fastCompare from "react-fast-compare";
import { Button } from "semantic-ui-react";
import { observer } from "mobx-react";

import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import InteriorPadding from "./InteriorPadding";

import HoldUntilPopup from "./HoldUntilPopup";
import SetpointPopup from "./SetpointPopup";
import DaysOfWeekPopup from "./DaysOfWeekPopup";
import TimeOfDayPopup from "./TimeOfDayPopup";

const ThermostatSettingBean: React.FunctionComponent<{
  mutableSettingsStore: ThermostatSettingsHelpers.MutableSettingsStore;
  thermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
  isNewSetting?: boolean;
  isSaving: boolean;
  onAfterRevert?: () => void;
  onAfterSave?: () => void;
}> = ({
  mutableSettingsStore,
  thermostatSetting,
  availableActions,
  isNewSetting,
  isSaving,
  onAfterRevert,
  onAfterSave,
}): React.ReactElement => {
  const [mutableSetting, updateMutableSetting] = useState(thermostatSetting);
  const isDirty = isNewSetting || !fastCompare(mutableSetting, thermostatSetting);

  return (
    <Button.Group style={{ padding: 4 }}>
      <Button style={{ paddingLeft: InteriorPadding / 2, paddingRight: 0 }}>
        {/* Just to provide left padding and equalize padding for remaining buttons */}
      </Button>

      {mutableSetting.type === GraphQL.ThermostatSettingType.Hold && (
        <HoldUntilPopup
          mutableSetting={mutableSetting}
          updateMutableSetting={updateMutableSetting}
        />
      )}

      {mutableSetting.type === GraphQL.ThermostatSettingType.Scheduled && (
        <>
          <DaysOfWeekPopup
            mutableSetting={mutableSetting}
            updateMutableSetting={updateMutableSetting}
          />
          <TimeOfDayPopup
            mutableSetting={mutableSetting}
            updateMutableSetting={updateMutableSetting}
          />
        </>
      )}

      <SetpointPopup
        action={GraphQL.ThermostatAction.Heat}
        availableActions={availableActions}
        iconColor="red"
        iconName="arrow up"
        mutableSetting={mutableSetting}
        updateMutableSetting={updateMutableSetting}
      />
      <SetpointPopup
        action={GraphQL.ThermostatAction.Cool}
        availableActions={availableActions}
        iconColor="blue"
        iconName="arrow down"
        mutableSetting={mutableSetting}
        updateMutableSetting={updateMutableSetting}
      />
      <SetpointPopup
        action={GraphQL.ThermostatAction.Circulate}
        availableActions={availableActions}
        iconColor="purple"
        iconName="sync alternate"
        mutableSetting={mutableSetting}
        updateMutableSetting={updateMutableSetting}
      />

      {isDirty && (
        <>
          <Button
            color="green"
            icon="save"
            loading={isSaving}
            onClick={async (): Promise<void> => {
              if (isNewSetting) {
                await mutableSettingsStore.onAdd(mutableSetting);
              } else {
                await mutableSettingsStore.onSave(mutableSetting);
              }

              if (onAfterSave) {
                onAfterSave();
              }
            }}
          />
          <Button
            color="grey"
            icon="undo"
            onClick={() => {
              updateMutableSetting(thermostatSetting);
              if (onAfterRevert) {
                onAfterRevert();
              }
            }}
          />
        </>
      )}

      {!isNewSetting && (
        <Button
          style={{
            paddingLeft: InteriorPadding,
            paddingRight: InteriorPadding,
            opacity: 0.8,
          }}
          icon="remove"
          onClick={() => mutableSettingsStore.onRemove(mutableSetting)}
        />
      )}
    </Button.Group>
  );
};

export default observer(ThermostatSettingBean);
