import React from "react";
import { List } from "react-native-paper";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import { TouchableOpacity } from "react-native-gesture-handler";
import fastCompare from "react-fast-compare";
import { observer } from "mobx-react";
import moment from "moment";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

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
  //
  // Derive description for Hold settings
  //

  const holdUntil = thermostatSetting.holdUntil || new Date(0);

  const maxDateValue = new Date(Math.pow(2, 31) * 1000); // cheap sentinel value - close enough...

  const currentExpirationText = (): string => {
    if (holdUntil.valueOf() < Date.now()) {
      return "(expired)";
    }
    if (holdUntil.valueOf() >= maxDateValue.valueOf()) {
      return "forever";
    }
    return `until ${moment(holdUntil).fromNow(true)} from now`;
  };

  //
  // Derive description for Scheduled settings
  //

  const isWeekend = (dayOfWeek: GraphQL.DayOfWeek): boolean => {
    return [GraphQL.DayOfWeek.Saturday, GraphQL.DayOfWeek.Sunday].includes(dayOfWeek);
  };

  const weekdayDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek => !isWeekend(dayOfWeek));

  const weekendDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek => isWeekend(dayOfWeek));

  // Rebuild in-day-order array for display and comparison purposes since they may be returned in arbitrary order
  const selectedDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek =>
    thermostatSetting.daysOfWeek?.includes(dayOfWeek)
  );

  const displayDays = (): string => {
    if (selectedDays.length === ThermostatSettingSchema.DaysOfWeek.length) {
      return "Everyday";
    }

    if (fastCompare(selectedDays, weekdayDays)) {
      return "Weekdays";
    }

    if (fastCompare(selectedDays, weekendDays)) {
      return "Weekends";
    }

    return selectedDays.map(day => day.substr(0, 3)).join(", ");
  };

  const formatTime = (value: number): string =>
    String(Math.floor(value / 60)).padStart(2, "0") +
    ":" +
    String(Math.round(value % 60)).padStart(2, "0");

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
            ? currentExpirationText()
            : `${displayDays()} at ${formatTime(thermostatSetting.atMinutesSinceMidnight || 0)}`
        }
      />
    </TouchableOpacity>
  );
};

export default withNavigation(observer(ThermostatSettingsListItem));
