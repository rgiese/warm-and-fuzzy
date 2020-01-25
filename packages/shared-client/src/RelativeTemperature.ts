import { Temperature } from "./Temperature";
import { TemperatureUnits } from "@grumpycorp/warm-and-fuzzy-shared";
import { UserPreferences } from "./UserPreferences";

export class RelativeTemperature {
  public valueInCelsius: number;

  public constructor(valueInCelsius: number) {
    this.valueInCelsius = valueInCelsius;
  }

  public static presentPreferredUnits(userPreferences?: UserPreferences): string {
    return "\u0394" + Temperature.presentPreferredUnits(userPreferences);
  }

  public toPreferredUnits(userPreferences?: UserPreferences): number {
    if (userPreferences?.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return (this.valueInCelsius * 9.0) / 5.0;
    }

    return this.valueInCelsius;
  }
}
