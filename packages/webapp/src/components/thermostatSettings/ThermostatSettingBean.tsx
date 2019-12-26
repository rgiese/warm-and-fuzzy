import React, { useState } from "react";
import fastCompare from "react-fast-compare";
import { Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import moment from "moment";

import * as GraphQL from "../../generated/graphqlClient";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import InteriorPadding from "./InteriorPadding";
import OnSave from "./OnSave";
import SetpointPopup from "./SetpointPopup";
import DaysOfWeekPopup from "./DaysOfWeekPopup";
import TimeOfDayPopup from "./TimeOfDayPopup";

const ThermostatSettingBean: React.FunctionComponent<{
  thermostatSetting: IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
  onSave: OnSave;
  isSaving: boolean;
}> = ({ thermostatSetting, availableActions, onSave, isSaving }): React.ReactElement => {
  const [mutableSetting, updateMutableSetting] = useState(thermostatSetting);
  const isDirty = !fastCompare(mutableSetting, thermostatSetting);

  const isHoldExpired = (holdUntil?: Date | null): boolean =>
    holdUntil ? holdUntil.valueOf() < Date.now() : true;

  return (
    <Button.Group style={{ padding: 4 }}>
      <Button style={{ paddingLeft: InteriorPadding / 2, paddingRight: 0 }}>
        {/* Just to provide left padding and equalize padding for remaining buttons */}
      </Button>

      {mutableSetting.type === GraphQL.ThermostatSettingType.Hold && (
        <Button
          content={
            !isHoldExpired(mutableSetting.holdUntil) ? (
              `Hold until ${moment(mutableSetting.holdUntil || Date.now()).fromNow(true)} from now`
            ) : (
              <span style={{ fontStyle: "italic" }}>Hold expired</span>
            )
          }
          style={{ paddingLeft: InteriorPadding / 2, paddingRight: InteriorPadding / 2 }}
        />
      )}

      {mutableSetting.type === GraphQL.ThermostatSettingType.Scheduled &&
        mutableSetting.atMinutesSinceMidnight && (
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
              await onSave(mutableSetting);
            }}
          />
          <Button
            color="grey"
            icon="undo"
            onClick={() => updateMutableSetting(thermostatSetting)}
          />
        </>
      )}

      <Button
        style={{
          paddingLeft: InteriorPadding,
          paddingRight: InteriorPadding,
          opacity: 0.8,
        }}
        icon="remove"
      />
    </Button.Group>
  );
};

export default observer(ThermostatSettingBean);
