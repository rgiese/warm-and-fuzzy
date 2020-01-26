import * as yup from "yup";

import { TemperatureUnits } from "../generated/graphqlTypes";

export namespace UserPreferencesSchema {
  export const Schema = yup.object().shape({
    temperatureUnits: yup
      .string()
      .required()
      .oneOf([TemperatureUnits.Celsius, TemperatureUnits.Fahrenheit]),
  });
}
