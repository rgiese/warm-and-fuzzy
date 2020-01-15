import React from "react";
import { List } from "react-native-paper";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import { TouchableOpacity } from "react-native-gesture-handler";
import { observer } from "mobx-react";

import { ThermostatSettingsHelpers } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../../generated/graphqlClient";

import { IconNames } from "../Theme";

import IndexedThermostatSetting from "./IndexedThermostatSetting";
import { ThermostatSettingNavigationParams } from "./ThermostatSettingScreen";
import ScreenRoutes from "../screens/ScreenRoutes";

import SetpointDisplay from "./SetpointDisplay";

const ThermostatSettingsListItem: React.FunctionComponent<{
  thermostatSetting: IndexedThermostatSetting;
  availableActions: GraphQL.ThermostatAction[];
} & NavigationInjectedProps> = ({
  thermostatSetting,
  availableActions,
  navigation,
}): React.ReactElement => {
  return (
    <TouchableOpacity
      onPress={() => {
        const params: ThermostatSettingNavigationParams = { availableActions, thermostatSetting };
        navigation.navigate(ScreenRoutes.ThermostatSetting, params);
      }}
    >
      <List.Item
        left={props => <List.Icon {...props} icon={IconNames[thermostatSetting.type]} />}
        title={
          <>
            {[
              GraphQL.ThermostatAction.Heat,
              GraphQL.ThermostatAction.Cool,
              GraphQL.ThermostatAction.Circulate,
            ].map(action => (
              <SetpointDisplay action={action} thermostatSetting={thermostatSetting} key={action} />
            ))}
          </>
        }
        description={
          thermostatSetting.type === GraphQL.ThermostatSettingType.Hold
            ? ThermostatSettingsHelpers.FormatHoldUntil(thermostatSetting.holdUntil || new Date(0))
            : `${ThermostatSettingsHelpers.FormatDaysOfWeekList(
                thermostatSetting.daysOfWeek || []
              )} at ${ThermostatSettingsHelpers.FormatMinutesSinceMidnight(
                thermostatSetting.atMinutesSinceMidnight || 0
              )}`
        }
      />
    </TouchableOpacity>
  );
};

export default withNavigation(observer(ThermostatSettingsListItem));
