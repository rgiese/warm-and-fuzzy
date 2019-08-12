import React from "react";
import { Text, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import { GlobalAuth } from "../services/Auth";

import AuthScreen from "./AuthScreen"
import HomeScreen from "./HomeScreen";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {}

class AuthLoadingScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();

    this.bootstrapAsync();
  }

  public static routeName = "AuthLoading";

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Loading...",
  };

  private async bootstrapAsync(): Promise<void> {
    await GlobalAuth.initialize();

    if (GlobalAuth.IsAuthenticated) {
      // If we believe we're still logged in, make sure our tokens are up-to-date,
      // then re-check below.
      await GlobalAuth.EnsureLoggedIn();
    }

    this.props.navigation.navigate(GlobalAuth.IsAuthenticated ? HomeScreen.routeName : AuthScreen.routeName);
  }

  public render(): React.ReactElement {
    return (
      <View>
        <Text>Loading auth...</Text>
      </View>
    );
  }
}

export default AuthLoadingScreen;
