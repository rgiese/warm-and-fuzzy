import React from "react";
import { ActivityIndicator, Button, Caption, Surface, Text, Title } from "react-native-paper";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { GlobalAuth } from "../services/Auth";

import BaseView from "../components/BaseView";
import GrumpyRobin from "../assets/grumpy-robin.svg";

import { ConfigStageName } from "../config";

import ScreenRoutes from "./ScreenRoutes";

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

  private handleLogin = async (): Promise<void> => {
    this.setState({ signingIn: true });

    const isAuthenticated = await GlobalAuth.login();

    if (isAuthenticated) {
      this.setState({ signingIn: false });
      this.props.navigation.navigate(ScreenRoutes.Home);
    }
  };

  public render(): React.ReactElement {
    return (
      <BaseView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {this.state.signingIn ? (
          <ActivityIndicator animating={true} />
        ) : (
          <>
            <Surface
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: 80,
                marginBottom: 20,
              }}
            >
              <GrumpyRobin width={60} height={60} />
            </Surface>
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
