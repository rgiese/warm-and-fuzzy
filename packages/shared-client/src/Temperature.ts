import { TemperatureUnits } from "@grumpycorp/warm-and-fuzzy-shared";
import { UserPreferences } from "./UserPreferences";

export class Temperature {
  public valueInCelsius: number;

  public constructor(valueInCelsius: number) {
    this.valueInCelsius = valueInCelsius;
  }

  public static presentPreferredUnits(userPreferences?: UserPreferences): string {
    if (userPreferences?.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return "\u00B0F";
    }

    return "\u00B0C";
  }

  public toPreferredUnits(userPreferences?: UserPreferences): number {
    if (userPreferences?.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return (this.valueInCelsius * 9.0) / 5.0 + 32;
    }

    return this.valueInCelsius;
  }
}
