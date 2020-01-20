import * as GraphQL from "../../generated/graphqlClient";

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

import InteriorPadding from "./InteriorPadding";
import React from "react";
import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

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
      on="click"
      position="top center"
      trigger={
        <Button style={{ paddingLeft: InteriorPadding / 2, paddingRight: InteriorPadding / 2 }}>
          <Icon color={iconColor} name={iconName} />
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
      wide="very"
    >
      <Popup.Content>
        <Form>
          <Form.Group inline>
            <Form.Field>
              <Checkbox
                checked={isActionAllowed}
                label={`${action} ${!isCirculate ? "to" : ""}`}
                onChange={(): void => {
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
                  max={ThermostatSettingSchema.SetPointRange.max}
                  min={ThermostatSettingSchema.SetPointRange.min}
                  onChange={(
                    _event: React.ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData
                  ): void => {
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
                  step={1}
                  type="number"
                  value={
                    action === GraphQL.ThermostatAction.Heat
                      ? mutableSetting.setPointHeat
                      : mutableSetting.setPointCool
                  }
                />
              </Form.Field>
            )}
          </Form.Group>
        </Form>
      </Popup.Content>
    </Popup>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
};

export default SetpointPopup;
