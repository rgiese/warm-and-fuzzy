import React from "react";
import { ScrollView, ViewStyle } from "react-native";
import { Theme, withTheme } from "react-native-paper";

interface Props {
  theme: Theme;
  contentContainerStyle?: ViewStyle;
}

class BaseView extends React.Component<Props> {
  public render(): React.ReactElement {
    return (
      <ScrollView
        style={{ backgroundColor: this.props.theme.colors.background, flex: 1 }}
        contentContainerStyle={this.props.contentContainerStyle}
      >
        {this.props.children}
      </ScrollView>
    );
  }
}

export default withTheme(BaseView);
