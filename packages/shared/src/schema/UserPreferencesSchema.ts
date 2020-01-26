import * as yup from "yup";

import { TemperatureUnits, UserPreferences } from "../generated/graphqlTypes";

export namespace UserPreferencesSchema {
  export const Schema = yup.object().shape({
    temperatureUnits: yup
      .string()
      .required()
      .oneOf([TemperatureUnits.Celsius, TemperatureUnits.Fahrenheit]),
  });

  export const DefaultUserPreferences: UserPreferences = {
    temperatureUnits: TemperatureUnits.Celsius,
  };

  export function UserPreferencesIsEqual(lhs: UserPreferences, rhs: UserPreferences): boolean {
    return lhs.temperatureUnits === rhs.temperatureUnits;
  }
}
