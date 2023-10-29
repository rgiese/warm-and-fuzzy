import * as yup from "yup";

import { TemperatureUnits } from "../generated/graphqlTypes";
import type { UserPreferences } from "../generated/graphqlTypes";

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

  export function UserPreferencesIsEqual(
    lhs: Readonly<UserPreferences>,
    rhs: Readonly<UserPreferences>
  ): boolean {
    return lhs.temperatureUnits === rhs.temperatureUnits;
  }
}
