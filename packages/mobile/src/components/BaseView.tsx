import React from "react";
import { View } from "react-native";
import { Theme, withTheme } from "react-native-paper";

const BaseView: React.FunctionComponent<{
  theme: Theme;
}> = ({ children, theme }): React.ReactElement => {
  return <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>{children}</View>;
};

export default withTheme(BaseView);
