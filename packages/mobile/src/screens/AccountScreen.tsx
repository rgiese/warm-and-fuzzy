import React from "react";
import { Button, Divider, List } from "react-native-paper";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import { GlobalAuth } from "../services/Auth";
import ApolloClient from "../services/ApolloClient";

import BaseView from "../components/BaseView";

import { ConfigStageName } from "../config";

import ScreenRoutes from "./ScreenRoutes";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {}

class AccountScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Account",
  };

  private handleLogout = async (): Promise<void> => {
    await GlobalAuth.logout();
    ApolloClient.resetStore();

    this.props.navigation.navigate(ScreenRoutes.Auth);
  };

  public render(): React.ReactElement {
    return (
      <BaseView>
        <List.Section title="Your account">
          <List.Item
            left={props => <List.Icon {...props} icon="person" />}
            title={GlobalAuth.UserName}
          />
          <List.Item
            left={props => <List.Icon {...props} icon="mail" />}
            title={GlobalAuth.UserEmail}
          />
          <Button mode="outlined" onPress={this.handleLogout}>
            Sign out
          </Button>
        </List.Section>
        <List.Section title="Your permissions">
          {GlobalAuth.Permissions.map(permission => (
            <List.Item
              left={props => <List.Icon {...props} icon="done" />}
              title={permission}
              key={permission}
            />
          ))}
        </List.Section>
        <Divider />
        <List.Section title="Tenant">
          <List.Item
            left={props => <List.Icon {...props} icon="home" />}
            title={GlobalAuth.Tenant}
          />
        </List.Section>
        <Divider />
        <List.Section title="API">
          <List.Item left={props => <List.Icon {...props} icon="http" />} title={ConfigStageName} />
        </List.Section>
      </BaseView>
    );
  }
}

export default AccountScreen;
