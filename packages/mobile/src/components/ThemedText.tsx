import { Text, Theme, withTheme } from "react-native-paper";

import { ColorCodes } from "../Theme";
import React from "react";
import { TextStyle } from "react-native";

/* eslint-disable react/no-multi-comp */

const accentText: React.FunctionComponent<{ theme: Theme; style?: TextStyle }> = ({
  children,
  style,
  theme,
}): React.ReactElement => {
  return <Text style={{ ...style, color: theme.colors.accent }}>{children}</Text>;
};

export const Accent = withTheme(accentText);

export const Heat: React.FunctionComponent<{ style?: TextStyle }> = ({
  children,
  style,
}): React.ReactElement => {
  return <Text style={{ ...style, color: ColorCodes.Heat }}>{children}</Text>;
};

export const Cool: React.FunctionComponent<{ style?: TextStyle }> = ({
  children,
  style,
}): React.ReactElement => {
  return <Text style={{ ...style, color: ColorCodes.Cool }}>{children}</Text>;
};

export const Circulate: React.FunctionComponent<{ style?: TextStyle }> = ({
  children,
  style,
}): React.ReactElement => {
  return <Text style={{ ...style, color: ColorCodes.Circulate }}>{children}</Text>;
};
