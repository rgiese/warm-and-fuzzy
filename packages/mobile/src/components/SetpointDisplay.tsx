import * as GraphQL from "../../generated/graphqlClient";

import { ColorCodes, IconNames } from "../Theme";
import { ThermostatSetting, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";
import PresentTemperatureWithUnits from "../shared/PresentTemperatureWithUnits";
import React from "react";
import { Text } from "react-native-paper";
import { observer } from "mobx-react";

const iconSize = 14;

const SetpointDisplay: React.FunctionComponent<{
  thermostatSetting: ThermostatSetting;
  action: GraphQL.ThermostatAction;
}> = ({ thermostatSetting, action }): React.ReactElement => {
  const isCirculate = action === GraphQL.ThermostatAction.Circulate;

  const rootStore = useRootStore();
  const userPreferences = rootStore.authStore.userPreferences;

  return thermostatSetting.allowedActions.includes(action) ? (
    <>
      <IconMDC color={ColorCodes[action]} name={IconNames[action]} size={iconSize} />
      <Text style={{ color: ColorCodes[action] }}>
        {isCirculate ? (
          <IconMDC color={ColorCodes[action]} name="check" size={iconSize} />
        ) : (
          PresentTemperatureWithUnits(
            action === GraphQL.ThermostatAction.Heat
              ? thermostatSetting.setPointHeat
              : thermostatSetting.setPointCool,
            userPreferences
          )
        )}
      </Text>
      <Text>&nbsp;</Text>
    </>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
};

export default observer(SetpointDisplay);
