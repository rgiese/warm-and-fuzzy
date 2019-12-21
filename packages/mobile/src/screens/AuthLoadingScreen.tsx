import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Title } from "react-native-paper";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { GlobalAuth } from "../services/Auth";

import BaseView from "../components/BaseView";

import ScreenRoutes from "./ScreenRoutes";

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

  private async bootstrapAsync(): Promise<void> {
    await GlobalAuth.initialize();

    if (GlobalAuth.IsAuthenticated) {
      // If we believe we're still logged in, make sure our tokens are up-to-date,
      // then re-check below.
      await GlobalAuth.EnsureLoggedIn();
    }

    this.props.navigation.navigate(
      GlobalAuth.IsAuthenticated ? ScreenRoutes.Home : ScreenRoutes.Auth
    );
  }

  public render(): React.ReactElement {
    return (
      <BaseView>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator animating={true} size="large" />
          <Title>Loading...</Title>
        </View>
      </BaseView>
    );
  }
}

export default AuthLoadingScreen;
