import React from "react";
import { ScrollView } from "react-native";
import { Button, Divider, List } from "react-native-paper";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { NavigationStackOptions } from "react-navigation-stack";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import BaseView from "../components/BaseView";

import { ConfigStageName } from "../config";

import ScreenRoutes from "./ScreenRoutes";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {}

class AccountScreen extends React.Component<Props, State> {
  static contextType = RootStoreContext;
  context!: React.ContextType<typeof RootStoreContext>;

  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  static navigationOptions: NavigationStackOptions = {
    title: "Account",
  };

  private handleLogout = async (): Promise<void> => {
    const authStore = this.context.rootStore.authStore;
    await authStore.authProvider.requestLogout();

    this.props.navigation.navigate(ScreenRoutes.Auth);
  };

  public render(): React.ReactElement {
    const authStore = this.context.rootStore.authStore;

    return (
      <BaseView>
        <ScrollView>
          <List.Section title="Your account">
            <List.Item
              left={props => <List.Icon {...props} icon="account" />}
              title={authStore.userName}
            />
            <List.Item
              left={props => <List.Icon {...props} icon="at" />}
              title={authStore.userEmail}
            />
            <Button mode="outlined" onPress={this.handleLogout}>
              Sign out
            </Button>
          </List.Section>
          <List.Section title="Your permissions">
            {authStore.userPermissions.map(permission => (
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
              title={authStore.tenant}
            />
          </List.Section>
          <Divider />
          <List.Section title="API">
            <List.Item
              left={props => <List.Icon {...props} icon="server" />}
              title={ConfigStageName}
            />
          </List.Section>
        </ScrollView>
      </BaseView>
    );
  }
}

export default AccountScreen;
