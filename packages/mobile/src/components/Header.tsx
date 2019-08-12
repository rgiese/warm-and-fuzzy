import React from "react";
import { DrawerActions, NavigationScreenProp, NavigationState } from "react-navigation";
import { Appbar } from "react-native-paper";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
  title?: string;
}

class State {}

class Header extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public render(): React.ReactElement {
    return (
      <Appbar.Header>
        <Appbar.Action
          icon="menu"
          onPress={(): boolean => this.props.navigation.dispatch(DrawerActions.toggleDrawer())}
        />
        {this.props.title && <Appbar.Content title={this.props.title} />}
      </Appbar.Header>
    );
  }
}

export default Header;
