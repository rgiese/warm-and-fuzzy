import { ActivityIndicator, Button, Caption, Surface, Text, Title } from "react-native-paper";

import BaseView from "../components/BaseView";
import { ConfigStageName } from "../config";
import GrumpyRobin from "../assets/grumpy-robin.svg";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import React from "react";
import ScreenRoutes from "./ScreenRoutes";
import { View } from "react-native";
import { observer } from "mobx-react";
import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

const AuthScreen: NavigationStackScreenComponent<{}> = ({ navigation }): React.ReactElement => {
  const authStore = useRootStore().authStore;

  if (authStore.state === "initializing" || authStore.state === "authenticating") {
    return (
      <BaseView>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator animating />
        </View>
      </BaseView>
    );
  } else if (authStore.state === "unauthenticated") {
    return (
      <BaseView>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
          <Button
            mode="contained"
            onPress={(): void => {
              authStore.authProvider.requestLogin();
            }}
          >
            Sign in
          </Button>
          <Caption style={{ marginTop: 20 }}>
            API target: <Text style={{ fontWeight: "bold" }}>{ConfigStageName}</Text>
          </Caption>
        </View>
      </BaseView>
    );
  } else if (authStore.state === "authenticated") {
    setImmediate(() => {
      // Can only run this once render is done
      navigation.navigate(ScreenRoutes.Home);
    });

    return <BaseView />;
  } else {
    throw new Error("Unexpected authentication state");
  }
};

export default observer(AuthScreen);
