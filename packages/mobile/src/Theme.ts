import { DarkTheme, Theme } from "react-native-paper";

const baseTheme = DarkTheme;

const appTheme: Theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: "#f26739",
    accent: "#999",
  },
};

export default appTheme;
