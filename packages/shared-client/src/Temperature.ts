import { CustomUnitTypeMembers, CustomUnitTypeStatics } from "./CustomUnitType";

import { TemperatureUnits } from "@grumpycorp/warm-and-fuzzy-shared";
import { UserPreferences } from "./UserPreferences";

// static implements CustomUnitTypeStatics<number> (see below)
export class Temperature implements CustomUnitTypeMembers<number> {
  public valueInCelsius: number;

  public constructor(valueInCelsius: number) {
    this.valueInCelsius = valueInCelsius;
  }

  //
  // Conversion and presentation capabilities as statics for optimized use
  //

  public static toPreferredUnits(
    valueInCelsius: number,
    userPreferences?: UserPreferences
  ): number {
    if (userPreferences?.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return (valueInCelsius * 9.0) / 5.0 + 32;
    }

    return valueInCelsius;
  }

  public static toString(valueInCelsius: number, userPreferences?: UserPreferences): string {
    return (
      Temperature.toPreferredUnits(valueInCelsius, userPreferences).toFixed(1) +
      Temperature.unitsToString(userPreferences)
    );
  }

  public static unitsToString(userPreferences?: UserPreferences): string {
    if (userPreferences?.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return "\u00B0F";
    }

    return "\u00B0C";
  }

  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  public toPreferredUnits(userPreferences?: UserPreferences): number {
    return Temperature.toPreferredUnits(this.valueInCelsius, userPreferences);
  }

  public toString(userPreferences?: UserPreferences): string {
    return Temperature.toString(this.valueInCelsius, userPreferences);
  }
}

const _customUnitTypeStaticsValidation: CustomUnitTypeStatics<number> = Temperature;
