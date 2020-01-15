import moment from "moment";
import fastCompare from "react-fast-compare";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "./generated/graphqlClient";

export namespace ThermostatSettingsHelpers {
  //
  // HoldUntil
  //

  export const HoldUntilForeverSentinel = new Date(Math.pow(2, 31) * 1000); // cheap sentinel value - close enough...

  export const FormatHoldUntil = (holdUntil: Date): string => {
    if (holdUntil.valueOf() < Date.now()) {
      return "(expired)";
    }
    if (holdUntil.valueOf() >= HoldUntilForeverSentinel.valueOf()) {
      return "forever";
    }
    return `until ${moment(holdUntil).fromNow(true)} from now`;
  };

  //
  // DaysOfWeek
  //

  export const IsWeekend = (dayOfWeek: GraphQL.DayOfWeek): boolean => {
    return [GraphQL.DayOfWeek.Saturday, GraphQL.DayOfWeek.Sunday].includes(dayOfWeek);
  };

  export const WeekdayDays = ThermostatSettingSchema.DaysOfWeek.filter(
    dayOfWeek => !IsWeekend(dayOfWeek)
  );
  export const WeekendDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek =>
    IsWeekend(dayOfWeek)
  );

  export const FormatDaysOfWeekList = (daysOfWeek: GraphQL.DayOfWeek[]): string => {
    // Rebuild in-day-order array for display and comparison purposes since they may be returned in arbitrary order
    const inOrderDaysOfWeek = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek =>
      daysOfWeek.includes(dayOfWeek)
    );

    if (inOrderDaysOfWeek.length === ThermostatSettingSchema.DaysOfWeek.length) {
      return "Everyday";
    }

    if (fastCompare(inOrderDaysOfWeek, WeekdayDays)) {
      return "Weekdays";
    }

    if (fastCompare(inOrderDaysOfWeek, WeekendDays)) {
      return "Weekends";
    }

    return inOrderDaysOfWeek.map(day => day.substr(0, 3)).join(", ");
  };

  //
  // AtMinutesSinceMidnight
  //

  export const FormatMinutesSinceMidnight = (value: number): string =>
    String(Math.floor(value / 60)).padStart(2, "0") +
    ":" +
    String(Math.round(value % 60)).padStart(2, "0");

  export const ParseMinutesSinceMidnight = (value: string): number => {
    const [hours, minutes] = value.split(":");
    return Number.parseInt(hours) * 60 + Number.parseInt(minutes);
  };
}
