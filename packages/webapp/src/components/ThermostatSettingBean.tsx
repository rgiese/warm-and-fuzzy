import React, { useState } from "react";
import fastCompare from "react-fast-compare";
import {
  Button,
  Checkbox,
  Form,
  Icon,
  Input,
  InputOnChangeData,
  Popup,
  SemanticCOLORS,
  SemanticICONS,
} from "semantic-ui-react";
import { observer } from "mobx-react";
import moment from "moment";

import * as GraphQL from "../generated/graphqlClient";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSetting } from "@grumpycorp/warm-and-fuzzy-shared-client";

export type IndexedThermostatSetting = ThermostatSetting & { index: number };

type OnSave = (updatedThermostatSetting: IndexedThermostatSetting) => Promise<void>;

const interiorPadding = 10;

//
// SetpointPopup
//

const SetpointPopup: React.FunctionComponent<{
  mutableSetting: IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<React.SetStateAction<IndexedThermostatSetting>>;
  action: GraphQL.ThermostatAction;
  availableActions: GraphQL.ThermostatAction[];
  iconColor: SemanticCOLORS;
  iconName: SemanticICONS;
}> = ({
  mutableSetting,
  updateMutableSetting,
  action,
  availableActions,
  iconColor,
  iconName,
}): React.ReactElement => {
  const isCirculate = action === GraphQL.ThermostatAction.Circulate;

  const isActionAllowed = mutableSetting.allowedActions.includes(action);

  return availableActions.includes(action) ? (
    <Popup
      position="top center"
      wide="very"
      on="click"
      trigger={
        <Button style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}>
          <Icon name={iconName} color={iconColor} />
          {mutableSetting.allowedActions.includes(action) ? (
            isCirculate ? (
              <Icon name="check" />
            ) : (
              <>
                {action === GraphQL.ThermostatAction.Heat
                  ? mutableSetting.setPointHeat
                  : mutableSetting.setPointCool}{" "}
                &deg;C
              </>
            )
          ) : (
            <Icon name="window minimize outline" />
          )}
        </Button>
      }
    >
      <Popup.Content>
        <Form>
          <Form.Group inline>
            <Form.Field>
              <Checkbox
                label={`${action} ${!isCirculate ? "to" : ""}`}
                checked={isActionAllowed}
                onChange={() => {
                  const allowedActions = isActionAllowed
                    ? mutableSetting.allowedActions.filter(
                        allowedAction => allowedAction !== action
                      )
                    : mutableSetting.allowedActions.concat(action);

                  updateMutableSetting({ ...mutableSetting, allowedActions });
                }}
              />
            </Form.Field>
            {!isCirculate && (
              <Form.Field>
                <Input
                  disabled={!isActionAllowed}
                  label={{ content: <>&deg; C</> }}
                  labelPosition="right"
                  value={
                    action === GraphQL.ThermostatAction.Heat
                      ? mutableSetting.setPointHeat
                      : mutableSetting.setPointCool
                  }
                  type="number"
                  min={ThermostatSettingSchema.SetPointRange.min}
                  max={ThermostatSettingSchema.SetPointRange.max}
                  step={1}
                  onChange={(
                    _event: React.ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData
                  ) => {
                    const setpoint = Number.parseFloat(data.value);
                    const updatedSetpoints =
                      action === GraphQL.ThermostatAction.Heat
                        ? { setPointHeat: setpoint }
                        : { setPointCool: setpoint };

                    updateMutableSetting({
                      ...mutableSetting,
                      ...updatedSetpoints,
                    });
                  }}
                />
              </Form.Field>
            )}
          </Form.Group>
        </Form>
      </Popup.Content>
    </Popup>
  ) : (
    <></>
  );
};

//
// ThermostatSettingBean
//

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
      <Button style={{ paddingLeft: interiorPadding / 2, paddingRight: 0 }}>
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
          style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
        />
      )}

      {mutableSetting.type === GraphQL.ThermostatSettingType.Scheduled &&
        mutableSetting.atMinutesSinceMidnight && (
          <>
            <Button
              content={mutableSetting.daysOfWeek?.map(day => day.substr(0, 3)).join(", ")}
              style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
            />
            <Button
              content={`at ${String(
                Math.floor(mutableSetting.atMinutesSinceMidnight / 60)
              ).padStart(2, "0")}:${String(
                Math.round(mutableSetting.atMinutesSinceMidnight % 60)
              ).padStart(2, "0")}`}
              style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
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
          paddingLeft: interiorPadding,
          paddingRight: interiorPadding,
          opacity: 0.8,
        }}
        icon="remove"
      />
    </Button.Group>
  );
};

export default observer(ThermostatSettingBean);
