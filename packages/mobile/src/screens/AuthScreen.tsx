import React from "react";
import { Button, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import { GlobalAuth } from "../services/Auth";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {
  public constructor() {}
}

class AuthScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Sign in",
  };

  private handleLogin = async (): Promise<void> => {
    const isAuthenticated = await GlobalAuth.login();

    if (isAuthenticated) {
      this.props.navigation.navigate("Home");
    }
  };

  public render(): React.ReactElement {
    return (
      <View>
        <Button title="Sign in" onPress={this.handleLogin} />
      </View>
    );
  }
}

export default AuthScreen;
