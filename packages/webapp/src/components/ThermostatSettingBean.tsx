import React, { useState } from "react";
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

const interiorPadding = 10;

const getSetpointFromSetting = (
  thermostatSetting: ThermostatSetting,
  action: GraphQL.ThermostatAction
): number => {
  if (action === GraphQL.ThermostatAction.Heat) {
    return thermostatSetting.setPointHeat;
  }

  if (action === GraphQL.ThermostatAction.Cool) {
    return thermostatSetting.setPointCool;
  }

  return 0;
};

const SetpointPopup: React.FunctionComponent<{
  thermostatSetting: ThermostatSetting;
  action: GraphQL.ThermostatAction;
  availableActions: GraphQL.ThermostatAction[];
  iconColor: SemanticCOLORS;
  iconName: SemanticICONS;
}> = ({ thermostatSetting, action, availableActions, iconColor, iconName }): React.ReactElement => {
  // Derived values
  const isCirculate = action === GraphQL.ThermostatAction.Circulate;
  const isActionAllowed = thermostatSetting.allowedActions.includes(action);
  const setpointValue = getSetpointFromSetting(thermostatSetting, action);

  // State about popup
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  // State inside popup
  const [popupIsActionAllowed, setPopupIsActionAllowed] = useState<boolean>(isActionAllowed);

  const [popupSetpoint, setPopupSetpoint] = useState<number>(setpointValue);

  const isPopupDirty = popupIsActionAllowed !== isActionAllowed || popupSetpoint !== setpointValue;

  return availableActions.includes(action) ? (
    <Popup
      position="top center"
      wide="very"
      on="click"
      trigger={
        <Button style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}>
          <Icon name={iconName} color={iconColor} />
          {thermostatSetting.allowedActions.includes(action) ? (
            isCirculate ? (
              <Icon name="check" />
            ) : (
              <>{setpointValue} &deg;C</>
            )
          ) : (
            <Icon name="window minimize outline" />
          )}
        </Button>
      }
      open={isPopupOpen}
      onOpen={() => setIsPopupOpen(true)}
      onClose={() => setIsPopupOpen(false)}
    >
      <Popup.Content>
        <Form>
          <Form.Group inline>
            <Form.Field>
              <Checkbox
                label={`${action} ${!isCirculate ? "to" : ""}`}
                checked={popupIsActionAllowed}
                onChange={() => setPopupIsActionAllowed(!popupIsActionAllowed)}
              />
            </Form.Field>
            {!isCirculate && (
              <Form.Field>
                <Input
                  disabled={!popupIsActionAllowed}
                  label={{ content: <>&deg; C</> }}
                  labelPosition="right"
                  value={popupSetpoint}
                  type="number"
                  min={ThermostatSettingSchema.SetPointRange.min}
                  max={ThermostatSettingSchema.SetPointRange.max}
                  step={1}
                  onChange={(
                    _event: React.ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData
                  ) => setPopupSetpoint(Number.parseFloat(data.value))}
                />
              </Form.Field>
            )}
            <Button
              color="green"
              icon="save"
              disabled={!isPopupDirty}
              onClick={() => {
                setIsPopupOpen(false);
              }}
            />
          </Form.Group>
        </Form>
      </Popup.Content>
    </Popup>
  ) : (
    <></>
  );
};

const ThermostatSettingBean: React.FunctionComponent<{
  thermostatSetting: ThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
}> = ({ thermostatSetting, availableActions }): React.ReactElement => {
  const isHoldExpired = (holdUntil?: Date | null): boolean =>
    holdUntil ? holdUntil.valueOf() < Date.now() : true;

  const formatHoldUntil = (holdUntil?: Date | null): React.ReactFragment =>
    !isHoldExpired(holdUntil) ? (
      `until ${moment(holdUntil || Date.now()).fromNow(true)} from now`
    ) : (
      <span style={{ fontStyle: "italic" }}>(expired)</span>
    );

  return (
    <Button.Group style={{ padding: 4 }}>
      <Button style={{ paddingLeft: interiorPadding / 2, paddingRight: 0 }}>
        {/* Just to provide left padding and equalize padding for remaining buttons */}
      </Button>

      <SetpointPopup
        action={GraphQL.ThermostatAction.Heat}
        iconColor="red"
        iconName="arrow up"
        thermostatSetting={thermostatSetting}
        availableActions={availableActions}
      />
      <SetpointPopup
        action={GraphQL.ThermostatAction.Cool}
        iconColor="blue"
        iconName="arrow down"
        thermostatSetting={thermostatSetting}
        availableActions={availableActions}
      />
      <SetpointPopup
        action={GraphQL.ThermostatAction.Circulate}
        iconColor="purple"
        iconName="sync alternate"
        thermostatSetting={thermostatSetting}
        availableActions={availableActions}
      />

      {thermostatSetting.type === GraphQL.ThermostatSettingType.Hold && (
        <Button
          content={formatHoldUntil(thermostatSetting.holdUntil)}
          style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
        />
      )}

      {thermostatSetting.type === GraphQL.ThermostatSettingType.Scheduled &&
        thermostatSetting.atMinutesSinceMidnight && (
          <Button
            content={`at ${String(
              Math.floor(thermostatSetting.atMinutesSinceMidnight / 60)
            ).padStart(2, "0")}:${String(
              Math.round(thermostatSetting.atMinutesSinceMidnight % 60)
            ).padStart(2, "0")}`}
            style={{ paddingLeft: interiorPadding / 2, paddingRight: interiorPadding / 2 }}
          />
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
