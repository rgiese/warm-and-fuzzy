import React from "react";
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

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import InteriorPadding from "./InteriorPadding";

const SetpointPopup: React.FunctionComponent<{
  mutableSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<
    React.SetStateAction<ThermostatSettingsHelpers.IndexedThermostatSetting>
  >;
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
        <Button style={{ paddingLeft: InteriorPadding / 2, paddingRight: InteriorPadding / 2 }}>
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

export default SetpointPopup;
