import { Theme, withTheme } from "react-native-paper";

import React from "react";
import { View } from "react-native";

const BaseView: React.FunctionComponent<{
  children: React.ReactNode;
  theme: Theme;
}> = ({ children, theme }): React.ReactElement => {
  return <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>{children}</View>;
};

export default withTheme(BaseView);
