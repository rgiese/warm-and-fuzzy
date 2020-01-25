export const enum TemperatureUnits {
  Celsius,
  Fahrenheit,
}

export function PresentTemperatureUnits(units: TemperatureUnits): string {
  if (units === TemperatureUnits.Celsius) {
    return "Celsius";
  } else if (units === TemperatureUnits.Fahrenheit) {
    return "Fahrenheit";
  } else {
    return "<unknown>";
  }
}
