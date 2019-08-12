import React from "react";
import { Button, Text, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import { GlobalAuth } from "../services/Auth";
import ApolloClient from "../services/ApolloClient";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {
  public constructor() {}
}

class SettingsScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Settings",
  };

  private handleLogout = async (): Promise<void> => {
    await GlobalAuth.logout();
    ApolloClient.resetStore();

    this.props.navigation.navigate("Auth");
  };

  public render(): React.ReactElement {
    return (
      <View>
        <Text>
          You are logged in, {GlobalAuth.UserName}. Your permissions: [
          {GlobalAuth.Permissions.join(", ")}]
        </Text>
        <Button title="Sign out" onPress={this.handleLogout} />
      </View>
    );
  }
}

export default SettingsScreen;
