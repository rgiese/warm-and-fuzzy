import React from "react";
import { ActivityIndicator, Button, Caption, Text, Title } from "react-native-paper";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { GlobalAuth } from "../services/Auth";

import HomeScreen from "./HomeScreen";

import BaseView from "../components/BaseView";

import { ConfigStageName } from "../config";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {
  signingIn: boolean;

  constructor() {
    this.signingIn = false;
  }
}

class AuthScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public static routeName = "Auth";

  private handleLogin = async (): Promise<void> => {
    this.setState({ signingIn: true });

    const isAuthenticated = await GlobalAuth.login();

    if (isAuthenticated) {
      this.setState({ signingIn: false });
      this.props.navigation.navigate(HomeScreen.routeName);
    }
  };

  public render(): React.ReactElement {
    return (
      <BaseView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {this.state.signingIn ? (
          <ActivityIndicator animating={true} />
        ) : (
          <>
            <Title style={{ marginBottom: 20 }}>Warm and Fuzzy</Title>
            <Button mode="contained" onPress={this.handleLogin}>
              Sign in
            </Button>
            <Caption style={{ marginTop: 20 }}>
              API target: <Text style={{ fontWeight: "bold" }}>{ConfigStageName}</Text>
            </Caption>
          </>
        )}
      </BaseView>
    );
  }
}

export default AuthScreen;
