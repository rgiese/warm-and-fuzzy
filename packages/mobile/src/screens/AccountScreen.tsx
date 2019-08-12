import React from "react";
import { Button, Text, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import { GlobalAuth } from "../services/Auth";
import ApolloClient from "../services/ApolloClient";

import AuthScreen from "./AuthScreen";

import { ConfigStageName } from "../config";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {}

class AccountScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public static routeName = "Account";

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Account",
  };

  private handleLogout = async (): Promise<void> => {
    await GlobalAuth.logout();
    ApolloClient.resetStore();

    this.props.navigation.navigate(AuthScreen.routeName);
  };

  public render(): React.ReactElement {
    return (
      <View>
        <Text>
          You are logged in, {GlobalAuth.UserName}. Your permissions: [
          {GlobalAuth.Permissions.join(", ")}]
        </Text>
        <Button title="Sign out" onPress={this.handleLogout} />
        <Text>API target: {ConfigStageName}</Text>
      </View>
    );
  }
}

export default AccountScreen;
