import React, { useContext } from "react";
import { View } from "react-native";
import { ActivityIndicator, Button, Caption, Surface, Text, Title } from "react-native-paper";
import { NavigationStackScreenComponent } from "react-navigation-stack";
import { observer } from "mobx-react";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import BaseView from "../components/BaseView";
import GrumpyRobin from "../assets/grumpy-robin.svg";

import { ConfigStageName } from "../config";

import ScreenRoutes from "./ScreenRoutes";

const AuthScreen: NavigationStackScreenComponent<{}> = ({ navigation }): React.ReactElement => {
  const authStore = useContext(RootStoreContext).rootStore.authStore;

  if (authStore.state === "initializing" || authStore.state === "authenticating") {
    return (
      <BaseView>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator animating={true} />
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
            onPress={() => {
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
