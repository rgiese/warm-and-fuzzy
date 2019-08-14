import { DarkTheme, Theme } from "react-native-paper";

import { ThermostatAction } from "../generated/graphqlClient";

const baseTheme = DarkTheme;

const appTheme: Theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: "#f26739",
    accent: "#999",
  },
};

export const ColorCodes = {
  [ThermostatAction.Heat]: "#ff7070",
  [ThermostatAction.Cool]: "#7070ff",
  [ThermostatAction.Circulate]: "#aa70ff",
};

export default appTheme;
