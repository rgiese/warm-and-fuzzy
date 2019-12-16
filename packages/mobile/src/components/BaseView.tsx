import React from "react";
import { View } from "react-native";
import { Theme, withTheme } from "react-native-paper";

interface Props {
  theme: Theme;
}

class BaseView extends React.Component<Props> {
  public render(): React.ReactElement {
    return (
      <View style={{ backgroundColor: this.props.theme.colors.background, flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}

export default withTheme(BaseView);
