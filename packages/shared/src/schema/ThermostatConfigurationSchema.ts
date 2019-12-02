import * as yup from "yup";

import { ThermostatAction } from "../generated/graphqlTypes";

export namespace ThermostatConfigurationSchema {
  export const Actions = [ThermostatAction.Heat, ThermostatAction.Cool, ThermostatAction.Circulate];

  export const SetPointRange = { min: 16, max: 40 };
  export const ThresholdRange = { min: 0.5, max: 5 };
  export const CadenceRange = { min: 30, max: 3600 };

  export const Schema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(),
    streamName: yup
      .string()
      .required()
      .matches(/^[a-zA-Z\d]+$/),
    availableActions: yup.array().of(yup.string().oneOf(Actions)),
    allowedActions: yup.array().of(yup.string().oneOf(Actions)),
    setPointHeat: yup
      .number()
      .min(SetPointRange.min)
      .max(SetPointRange.max),
    setPointCool: yup
      .number()
      .min(SetPointRange.min)
      .max(SetPointRange.max),
    externalSensorId: yup
      .string()
      .notRequired()
      .matches(/^$|^[a-f0-9]{16}$/),
    threshold: yup
      .number()
      .min(ThresholdRange.min)
      .max(ThresholdRange.max),
    cadence: yup
      .number()
      .integer()
      .min(CadenceRange.min)
      .max(CadenceRange.max),
  });
}
