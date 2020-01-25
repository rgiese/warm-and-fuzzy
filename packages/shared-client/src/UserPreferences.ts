import { TemperatureUnits } from "@grumpycorp/warm-and-fuzzy-shared";

export class UserPreferences {
  public temperatureUnits: TemperatureUnits;

  public constructor() {
    this.temperatureUnits = TemperatureUnits.Celsius;
  }
}
