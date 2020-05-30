import { CustomUnitTypeMembers, CustomUnitTypeStatics } from "./CustomUnitType";
import { TemperatureUnits, UserPreferences } from "./generated/graphqlClient";

// static implements CustomUnitTypeStatics<number> (see below)
export class Temperature implements CustomUnitTypeMembers<number> {
  public valueInCelsius: number;

  public constructor(valueInCelsius: number) {
    this.valueInCelsius = valueInCelsius;
  }

  //
  // Conversion and presentation capabilities as statics for optimized use
  //

  public static fromPreferredUnits(
    valueInPreferredUnits: number,
    userPreferences: Readonly<UserPreferences>
  ): number {
    if (userPreferences.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return ((valueInPreferredUnits - 32.0) * 5.0) / 9.0;
    }

    return valueInPreferredUnits;
  }

  public static toPreferredUnits(
    valueInCelsius: number,
    userPreferences: Readonly<UserPreferences>
  ): number {
    if (userPreferences.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return (valueInCelsius * 9.0) / 5.0 + 32.0;
    }

    return valueInCelsius;
  }

  public static toString(
    valueInCelsius: number,
    userPreferences: Readonly<UserPreferences>
  ): string {
    return (
      Temperature.toPreferredUnits(valueInCelsius, userPreferences).toFixed(1) +
      Temperature.unitsToString(userPreferences)
    );
  }

  public static unitsToString(userPreferences: Readonly<UserPreferences>): string {
    if (userPreferences.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return "\u00B0F";
    }

    return "\u00B0C";
  }

  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  public toPreferredUnits(userPreferences: Readonly<UserPreferences>): number {
    return Temperature.toPreferredUnits(this.valueInCelsius, userPreferences);
  }

  public toString(userPreferences: Readonly<UserPreferences>): string {
    return Temperature.toString(this.valueInCelsius, userPreferences);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error TS6133 /* declared but its value is never read */
const _customUnitTypeStaticsValidation: CustomUnitTypeStatics<number> = Temperature;
