import * as yup from "yup";

import { DayOfWeek, ThermostatAction, ThermostatSettingType } from "../generated/graphqlTypes";

export namespace ThermostatSettingSchema {
  export const Types = [ThermostatSettingType.Hold, ThermostatSettingType.Scheduled];

  export const DaysOfWeek = [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
    DayOfWeek.Sunday,
  ];

  export const Actions = [ThermostatAction.Heat, ThermostatAction.Cool, ThermostatAction.Circulate];

  export const SetPointRange = { min: 16, max: 40 };

  export const Schema = yup.object().shape({
    type: yup
      .string()
      .required()
      .oneOf(Types),

    // For Hold settings
    holdUntil: yup
      .date()
      .when("type", { is: ThermostatSettingType.Hold, then: yup.date().required() }),

    // For Scheduled settings
    daysOfWeek: yup
      .array()
      .of(yup.string().oneOf(DaysOfWeek))
      .when("type", {
        is: ThermostatSettingType.Scheduled,
        then: yup
          .array()
          .required()
          .min(1)
          .max(7),
        otherwise: yup.array().max(0),
      }),
    atMinutesSinceMidnight: yup.number().when("type", {
      is: ThermostatSettingType.Scheduled,
      then: yup
        .number()
        .required()
        .min(0)
        .lessThan(24 * 60),
    }),

    // For all types
    allowedActions: yup.array().of(yup.string().oneOf(Actions)),
    setPointHeat: yup
      .number()
      .required()
      .min(SetPointRange.min)
      .max(SetPointRange.max),
    setPointCool: yup
      .number()
      .required()
      .min(SetPointRange.min)
      .max(SetPointRange.max),
  });
}
