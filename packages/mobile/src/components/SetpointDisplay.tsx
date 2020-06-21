import * as GraphQL from "../../generated/graphqlClient";

import { ColorCodes, IconNames } from "../Theme";
import {
  Temperature,
  ThermostatSetting,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text } from "react-native-paper";
import { observer } from "mobx-react";

const iconSize = 14;

function SetpointDisplay({
  thermostatSetting,
  action,
}: {
  thermostatSetting: ThermostatSetting;
  action: GraphQL.ThermostatAction;
}): React.ReactElement {
  const rootStore = useRootStore();
  const userPreferences = rootStore.userPreferencesStore.userPreferences;

  function formatTemperatureForAction(): string {
    switch (action) {
      case GraphQL.ThermostatAction.Heat:
        return Temperature.toString(thermostatSetting.setPointHeat, userPreferences);
      case GraphQL.ThermostatAction.Cool:
        return Temperature.toString(thermostatSetting.setPointCool, userPreferences);
      case GraphQL.ThermostatAction.Circulate:
        return (
          Temperature.toString(thermostatSetting.setPointCirculateAbove, userPreferences) +
          " / " +
          Temperature.toString(thermostatSetting.setPointCirculateBelow, userPreferences)
        );
    }
  }
  return thermostatSetting.allowedActions.includes(action) ? (
    <>
      <IconMDC color={ColorCodes[action]} name={IconNames[action]} size={iconSize} />
      <Text style={{ color: ColorCodes[action] }}>{formatTemperatureForAction()}</Text>
      <Text>&nbsp;</Text>
    </>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
}

export default observer(SetpointDisplay);
