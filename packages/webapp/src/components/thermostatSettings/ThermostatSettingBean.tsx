import * as GraphQL from "../../generated/graphqlClient";

import React, { useState } from "react";

import { Button } from "semantic-ui-react";
import DaysOfWeekPopup from "./DaysOfWeekPopup";
import HoldUntilPopup from "./HoldUntilPopup";
import InteriorPadding from "./InteriorPadding";
import SetpointPopup from "./SetpointPopup";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";
import TimeOfDayPopup from "./TimeOfDayPopup";
import fastCompare from "react-fast-compare";
import { observer } from "mobx-react";

function ThermostatSettingBean({
  mutableSettingsStore,
  thermostatSetting,
  availableActions,
  isNewSetting,
  isSaving,
  onAfterRevert,
  onAfterSave,
}: {
  mutableSettingsStore: ThermostatSettingsHelpers.MutableSettingsStore;
  thermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
  isNewSetting?: boolean;
  isSaving: boolean;
  onAfterRevert?: () => void;
  onAfterSave?: () => void;
}): React.ReactElement {
  const [mutableSetting, updateMutableSetting] = useState(thermostatSetting);
  const isDirty = isNewSetting ?? !fastCompare(mutableSetting, thermostatSetting);

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
            onClick={(): void => {
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
          icon="remove"
          onClick={async (): Promise<void> => mutableSettingsStore.onRemove(mutableSetting)}
          style={{
            paddingLeft: InteriorPadding,
            paddingRight: InteriorPadding,
            opacity: 0.8,
          }}
        />
      )}
    </Button.Group>
  );
}

export default observer(ThermostatSettingBean);
