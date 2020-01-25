import { CustomUnitTypeMembers, CustomUnitTypeStatics } from "./CustomUnitType";

import { Temperature } from "./Temperature";
import { TemperatureUnits } from "@grumpycorp/warm-and-fuzzy-shared";
import { UserPreferences } from "./UserPreferences";

// static implements CustomUnitTypeStatics<number> (see below)
export class RelativeTemperature implements CustomUnitTypeMembers<number> {
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
      return (valueInCelsius * 9.0) / 5.0;
    }

    return valueInCelsius;
  }

  public static toString(valueInCelsius: number, userPreferences?: UserPreferences): string {
    return (
      RelativeTemperature.toPreferredUnits(valueInCelsius, userPreferences).toFixed(1) +
      RelativeTemperature.unitsToString(userPreferences)
    );
  }

  public static unitsToString(userPreferences?: UserPreferences): string {
    // Prepend Delta to desired temperature units
    return "\u0394" + Temperature.unitsToString(userPreferences);
  }

  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  public toPreferredUnits(userPreferences?: UserPreferences): number {
    return RelativeTemperature.toPreferredUnits(this.valueInCelsius, userPreferences);
  }

  public toString(userPreferences?: UserPreferences): string {
    return RelativeTemperature.toString(this.valueInCelsius, userPreferences);
  }
}

const _customUnitTypeStaticsValidation: CustomUnitTypeStatics<number> = RelativeTemperature;
