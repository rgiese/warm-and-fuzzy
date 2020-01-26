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
import {
  RelativeTemperature,
  Temperature,
  ThermostatSettingsHelpers,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import InteriorPadding from "./InteriorPadding";
import React from "react";
import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

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
  const rootStore = useRootStore();
  const userPreferences = rootStore.userPreferencesStore.userPreferences;

  const isCirculate = action === GraphQL.ThermostatAction.Circulate;

  const isActionAllowed = mutableSetting.allowedActions.includes(action);

  const temperatureStepInCelsius = 1.0; // Round setpoint to multiple of `temperatureStepInCelsius`

  const roundToMultipleOf = (value: number, roundToMultipleOf: number): number => {
    const numberOfMultiples = value / roundToMultipleOf;
    const roundedNumberOfMultiples = Math.round(numberOfMultiples);
    const roundedToMultiples = roundedNumberOfMultiples * roundToMultipleOf;

    return roundedToMultiples;
  };

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
              Temperature.toString(
                action === GraphQL.ThermostatAction.Heat
                  ? mutableSetting.setPointHeat
                  : mutableSetting.setPointCool,
                userPreferences
              )
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
                  label={Temperature.unitsToString(userPreferences)}
                  labelPosition="right"
                  max={Temperature.toPreferredUnits(
                    ThermostatSettingSchema.SetPointRange.max,
                    userPreferences
                  )}
                  min={Temperature.toPreferredUnits(
                    ThermostatSettingSchema.SetPointRange.min,
                    userPreferences
                  )}
                  onChange={(
                    _event: React.ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData
                  ): void => {
                    const setpointInPreferredUnits = Number.parseFloat(data.value);
                    const setpointInBaseUnits = Temperature.fromPreferredUnits(
                      setpointInPreferredUnits,
                      userPreferences
                    );
                    const setpoint = roundToMultipleOf(
                      setpointInBaseUnits,
                      temperatureStepInCelsius
                    );

                    const updatedSetpoints =
                      action === GraphQL.ThermostatAction.Heat
                        ? { setPointHeat: setpoint }
                        : { setPointCool: setpoint };

                    updateMutableSetting({
                      ...mutableSetting,
                      ...updatedSetpoints,
                    });
                  }}
                  step={RelativeTemperature.toPreferredUnits(
                    temperatureStepInCelsius,
                    userPreferences
                  )}
                  type="number"
                  value={Temperature.toPreferredUnits(
                    action === GraphQL.ThermostatAction.Heat
                      ? mutableSetting.setPointHeat
                      : mutableSetting.setPointCool,
                    userPreferences
                  )}
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
