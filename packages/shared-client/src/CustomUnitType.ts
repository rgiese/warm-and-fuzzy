import { UserPreferences } from "./generated/graphqlClient";

export interface CustomUnitTypeMembers<T> {
  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  toPreferredUnits: (userPreferences: Readonly<UserPreferences>) => T;

  toString: (userPreferences: Readonly<UserPreferences>) => string;
}

export interface CustomUnitTypeStatics<T> {
  //
  // Conversion and presentation capabilities as statics for optimized use
  //

  fromPreferredUnits: (value: Readonly<T>, userPreferences: Readonly<UserPreferences>) => T;

  toPreferredUnits: (value: Readonly<T>, userPreferences: Readonly<UserPreferences>) => T;

  toString: (value: Readonly<T>, userPreferences: Readonly<UserPreferences>) => string;

  unitsToString: (userPreferences: Readonly<UserPreferences>) => string;
}
