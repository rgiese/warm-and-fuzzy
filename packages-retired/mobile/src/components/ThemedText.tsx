import { Text, Theme, withTheme } from "react-native-paper";

import { ColorCodes } from "../Theme";
import React from "react";
import { TextStyle } from "react-native";

/* eslint-disable react/no-multi-comp */

function accentText({
  children,
  style,
  theme,
}: {
  theme: Theme;
  style?: TextStyle;
  children?: React.ReactNode;
}): React.ReactElement {
  return <Text style={{ ...style, color: theme.colors.accent }}>{children}</Text>;
}

export const Accent = withTheme(accentText);

export function Heat({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}): React.ReactElement {
  return <Text style={{ ...style, color: ColorCodes.Heat }}>{children}</Text>;
}

export function Cool({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}): React.ReactElement {
  return <Text style={{ ...style, color: ColorCodes.Cool }}>{children}</Text>;
}

export function Circulate({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: TextStyle;
}): React.ReactElement {
  return <Text style={{ ...style, color: ColorCodes.Circulate }}>{children}</Text>;
}
