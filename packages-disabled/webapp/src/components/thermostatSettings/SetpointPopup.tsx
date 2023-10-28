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
  ThermostatSetting,
  ThermostatSettingsHelpers,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import InteriorPadding from "./InteriorPadding";
import React from "react";
import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

/* eslint-disable react/no-multi-comp */

function SetpointPopup({
  mutableSetting,
  updateMutableSetting,
  action,
  availableActions,
  iconColor,
  iconName,
}: {
  mutableSetting: ThermostatSettingsHelpers.IndexedThermostatSetting;
  updateMutableSetting: React.Dispatch<
    React.SetStateAction<ThermostatSettingsHelpers.IndexedThermostatSetting>
  >;
  action: GraphQL.ThermostatAction;
  availableActions: GraphQL.ThermostatAction[];
  iconColor: SemanticCOLORS;
  iconName: SemanticICONS;
}): React.ReactElement {
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

  function formatTemperatureForAction(): string {
    switch (action) {
      case GraphQL.ThermostatAction.Heat:
        return Temperature.toString(mutableSetting.setPointHeat, userPreferences);
      case GraphQL.ThermostatAction.Cool:
        return Temperature.toString(mutableSetting.setPointCool, userPreferences);
      case GraphQL.ThermostatAction.Circulate:
        return (
          Temperature.toString(mutableSetting.setPointCirculateAbove, userPreferences) +
          " / " +
          Temperature.toString(mutableSetting.setPointCirculateBelow, userPreferences)
        );
    }
  }

  function buildControlForSetPoint(
    setPointName:
      | "setPointHeat"
      | "setPointCool"
      | "setPointCirculateAbove"
      | "setPointCirculateBelow",
    label?: string
  ): React.ReactElement {
    return (
      <Form.Field>
        {label && <label>{label}</label>}
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
            const setpoint = roundToMultipleOf(setpointInBaseUnits, temperatureStepInCelsius);

            const updatedSetpoints: Partial<ThermostatSetting> = { [setPointName]: setpoint };

            updateMutableSetting({
              ...mutableSetting,
              ...updatedSetpoints,
            });
          }}
          step={RelativeTemperature.toPreferredUnits(temperatureStepInCelsius, userPreferences)}
          type="number"
          value={Temperature.toPreferredUnits(mutableSetting[setPointName], userPreferences)}
        />
      </Form.Field>
    );
  }

  function buildControlsForAction(): React.ReactElement {
    switch (action) {
      case GraphQL.ThermostatAction.Heat:
        return buildControlForSetPoint("setPointHeat");
      case GraphQL.ThermostatAction.Cool:
        return buildControlForSetPoint("setPointCool");
      case GraphQL.ThermostatAction.Circulate:
        return (
          <Form.Group>
            {buildControlForSetPoint("setPointCirculateAbove", "above")}
            {buildControlForSetPoint("setPointCirculateBelow", "below")}
          </Form.Group>
        );
    }
  }

  return availableActions.includes(action) ? (
    <Popup
      on="click"
      position="top center"
      trigger={
        <Button style={{ paddingLeft: InteriorPadding / 2, paddingRight: InteriorPadding / 2 }}>
          <Icon color={iconColor} name={iconName} />
          {mutableSetting.allowedActions.includes(action) ? (
            formatTemperatureForAction()
          ) : (
            <Icon name="window minimize outline" />
          )}
        </Button>
      }
      wide="very"
    >
      <Popup.Content>
        <Form>
          <Form.Field>
            <Checkbox
              checked={isActionAllowed}
              label={`${action} ${!isCirculate ? "to" : "if"}`}
              onChange={(): void => {
                const allowedActions = isActionAllowed
                  ? mutableSetting.allowedActions.filter(allowedAction => allowedAction !== action)
                  : mutableSetting.allowedActions.concat(action);

                updateMutableSetting({ ...mutableSetting, allowedActions });
              }}
            />
          </Form.Field>
          {buildControlsForAction()}
        </Form>
      </Popup.Content>
    </Popup>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
}

export default SetpointPopup;
