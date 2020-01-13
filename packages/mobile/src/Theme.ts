import { DarkTheme, Theme } from "react-native-paper";

import { ThermostatAction } from "../generated/graphqlClient";
import { ThermostatSettingType } from "@grumpycorp/warm-and-fuzzy-shared/build/generated/graphqlTypes";

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

export const IconNames = {
  [ThermostatAction.Heat]: "arrow-collapse-up",
  [ThermostatAction.Cool]: "arrow-collapse-down",
  [ThermostatAction.Circulate]: "autorenew",
  [ThermostatSettingType.Hold]: "gesture-tap-hold",
  [ThermostatSettingType.Scheduled]: "clock-outline",
};

export default appTheme;
