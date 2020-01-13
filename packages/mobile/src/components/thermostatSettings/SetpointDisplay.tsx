import React from "react";
import { Text } from "react-native-paper";
import IconMDC from "react-native-vector-icons/MaterialCommunityIcons";
import { observer } from "mobx-react";

import { ThermostatSetting } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../../generated/graphqlClient";

import { ColorCodes, IconNames } from "../../Theme";

const iconSize = 14;

const SetpointDisplay: React.FunctionComponent<{
  thermostatSetting: ThermostatSetting;
  action: GraphQL.ThermostatAction;
}> = ({ thermostatSetting, action }): React.ReactElement => {
  const isCirculate = action === GraphQL.ThermostatAction.Circulate;

  return thermostatSetting.allowedActions.includes(action) ? (
    <>
      <IconMDC name={IconNames[action]} size={iconSize} color={ColorCodes[action]} />
      <Text style={{ color: ColorCodes[action] }}>
        {isCirculate ? (
          <IconMDC name="check" size={iconSize} color={ColorCodes[action]} />
        ) : (
          <>
            {action === GraphQL.ThermostatAction.Heat
              ? thermostatSetting.setPointHeat
              : thermostatSetting.setPointCool}{" "}
            &deg;C
          </>
        )}
      </Text>
      <Text>&nbsp;</Text>
    </>
  ) : (
    <></>
  );
};

export default observer(SetpointDisplay);
