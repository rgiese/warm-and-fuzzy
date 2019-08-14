import React from "react";
import { TextStyle } from "react-native";
import { Text, Theme, withTheme } from "react-native-paper";

import { ColorCodes } from "../Theme";

interface Props {
  theme: Theme;
  style?: TextStyle;
}

const accentText: React.FunctionComponent<Props> = (props): React.ReactElement => {
  return <Text style={{ ...props.style, color: props.theme.colors.accent }}>{props.children}</Text>;
};

export const Accent = withTheme(accentText);

const heatText: React.FunctionComponent<Props> = (props): React.ReactElement => {
  return <Text style={{ ...props.style, color: ColorCodes.Heat }}>{props.children}</Text>;
};

export const Heat = withTheme(heatText);

const coolText: React.FunctionComponent<Props> = (props): React.ReactElement => {
  return <Text style={{ ...props.style, color: ColorCodes.Cool }}>{props.children}</Text>;
};

export const Cool = withTheme(coolText);

const circulateText: React.FunctionComponent<Props> = (props): React.ReactElement => {
  return <Text style={{ ...props.style, color: ColorCodes.Circulate }}>{props.children}</Text>;
};

export const Circulate = withTheme(circulateText);
