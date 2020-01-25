import { UserPreferences } from "./UserPreferences";

export interface CustomUnitTypeMembers<T> {
  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  toPreferredUnits(userPreferences?: UserPreferences): T;

  toString(userPreferences?: UserPreferences): string;
}

export interface CustomUnitTypeStatics<T> {
  //
  // Conversion and presentation capabilities as statics for optimized use
  //

  toPreferredUnits(value: T, userPreferences?: UserPreferences): T;

  toString(value: number, userPreferences?: UserPreferences): string;

  unitsToString(userPreferences?: UserPreferences): string;
}
