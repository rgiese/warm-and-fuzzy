import { Button, Divider, List } from "react-native-paper";

import BaseView from "../components/BaseView";
import { ConfigStageName } from "../config";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import React from "react";
import ScreenRoutes from "./ScreenRoutes";
import { ScrollView } from "react-native";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

const AccountScreen: NavigationStackScreenComponent<{}> = ({ navigation }): React.ReactElement => {
  const authStore = useRootStore().authStore;

  return (
    <BaseView>
      <ScrollView>
        <List.Section title="Your account">
          <List.Item
            left={(): React.ReactNode => <List.Icon icon="account" />}
            title={authStore.userName}
          />
          <List.Item
            left={(): React.ReactNode => <List.Icon icon="at" />}
            title={authStore.userEmail}
          />
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
              key={permission}
              left={(): React.ReactNode => <List.Icon icon="check" />}
              title={permission}
            />
          ))}
        </List.Section>
        <Divider />
        <List.Section title="Tenant">
          <List.Item
            left={(): React.ReactNode => <List.Icon icon="home" />}
            title={authStore.tenant}
          />
        </List.Section>
        <Divider />
        <List.Section title="API">
          <List.Item
            left={(): React.ReactNode => <List.Icon icon="server" />}
            title={ConfigStageName}
          />
        </List.Section>
      </ScrollView>
    </BaseView>
  );
};

AccountScreen.navigationOptions = {
  title: "Account",
};

export default AccountScreen;
