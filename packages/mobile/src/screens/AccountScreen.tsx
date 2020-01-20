import React from "react";
import { ScrollView } from "react-native";
import { Button, Divider, List } from "react-native-paper";
import { NavigationStackScreenComponent } from "react-navigation-stack";

import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import BaseView from "../components/BaseView";

import { ConfigStageName } from "../config";

import ScreenRoutes from "./ScreenRoutes";

const AccountScreen: NavigationStackScreenComponent<{}> = ({ navigation }): React.ReactElement => {
  const authStore = useRootStore().authStore;

  return (
    <BaseView>
      <ScrollView>
        <List.Section title="Your account">
          <List.Item left={_props => <List.Icon icon="account" />} title={authStore.userName} />
          <List.Item left={_props => <List.Icon icon="at" />} title={authStore.userEmail} />
          <Button
            mode="outlined"
            onPress={async (): Promise<void> => {
              await authStore.authProvider.requestLogout();

              navigation.navigate(ScreenRoutes.Auth);
            }}
          >
            Sign out
          </Button>
        </List.Section>
        <List.Section title="Your permissions">
          {authStore.userPermissions.map(permission => (
            <List.Item
              left={_props => <List.Icon icon="check" />}
              title={permission}
              key={permission}
            />
          ))}
        </List.Section>
        <Divider />
        <List.Section title="Tenant">
          <List.Item left={_props => <List.Icon icon="home" />} title={authStore.tenant} />
        </List.Section>
        <Divider />
        <List.Section title="API">
          <List.Item left={_props => <List.Icon icon="server" />} title={ConfigStageName} />
        </List.Section>
      </ScrollView>
    </BaseView>
  );
};

AccountScreen.navigationOptions = {
  title: "Account",
};

export default AccountScreen;
