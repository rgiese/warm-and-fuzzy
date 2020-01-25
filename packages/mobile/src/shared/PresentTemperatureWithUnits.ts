import { Temperature, UserPreferences } from "@grumpycorp/warm-and-fuzzy-shared-client";

const PresentTemperatureWithUnits = (
  valueInCelsius: number,
  userPreferences?: UserPreferences
): string => {
  return (
    new Temperature(valueInCelsius).toPreferredUnits(userPreferences).toFixed(1) +
    Temperature.presentPreferredUnits(userPreferences)
  );
};

export default PresentTemperatureWithUnits;
