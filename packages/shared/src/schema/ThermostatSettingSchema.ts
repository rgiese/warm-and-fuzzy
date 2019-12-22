import * as yup from "yup";

import { ThermostatAction } from "../generated/graphqlTypes";

export namespace ThermostatSettingSchema {
  export const Actions = [ThermostatAction.Heat, ThermostatAction.Cool, ThermostatAction.Circulate];

  export const SetPointRange = { min: 16, max: 40 };

  export const Schema = yup.object().shape({
    allowedActions: yup.array().of(yup.string().oneOf(Actions)),
    setPointHeat: yup
      .number()
      .min(SetPointRange.min)
      .max(SetPointRange.max),
    setPointCool: yup
      .number()
      .min(SetPointRange.min)
      .max(SetPointRange.max),
  });
}
