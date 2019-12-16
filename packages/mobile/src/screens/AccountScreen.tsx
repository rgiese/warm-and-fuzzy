import React from "react";
import { Button, Divider, List } from "react-native-paper";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { NavigationStackOptions } from "react-navigation-stack";

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

  static navigationOptions: NavigationStackOptions = {
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
            left={props => <List.Icon {...props} icon="account" />}
            title={GlobalAuth.UserName}
          />
          <List.Item
            left={props => <List.Icon {...props} icon="at" />}
            title={GlobalAuth.UserEmail}
          />
          <Button mode="outlined" onPress={this.handleLogout}>
            Sign out
          </Button>
        </List.Section>
        <List.Section title="Your permissions">
          {GlobalAuth.Permissions.map(permission => (
            <List.Item
              left={props => <List.Icon {...props} icon="check" />}
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
          <List.Item
            left={props => <List.Icon {...props} icon="server" />}
            title={ConfigStageName}
          />
        </List.Section>
      </BaseView>
    );
  }
}

export default AccountScreen;
