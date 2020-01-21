import {
  ApolloClient,
  AuthStore,
  RootStore,
  RootStoreContext,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import AppTheme from "./Theme";
import Auth from "./services/Auth";
import { configure as MobxConfigure } from "mobx";
import { Provider as PaperProvider } from "react-native-paper";
import React from "react";
import ScreenProps from "./screens/ScreenProps";
import Screens from "./screens";
import config from "./config";

// App-wide MobX configuration
MobxConfigure({ enforceActions: "observed" });

const authProvider = new Auth();
const authStore = new AuthStore(authProvider, "initializing");

// eslint-disable-next-line @typescript-eslint/no-floating-promises
authProvider.initializeStore(authStore);

const apolloClient = new ApolloClient(authStore, config.apiGateway.URL);

const rootStore = new RootStore(authStore, apolloClient);

const App: React.FunctionComponent = (): React.ReactElement => {
  const screenProps: ScreenProps = {
    theme: AppTheme,
  };

  return (
    <PaperProvider theme={screenProps.theme}>
      <RootStoreContext.Provider value={{ rootStore }}>
        <Screens screenProps={screenProps} />
      </RootStoreContext.Provider>
    </PaperProvider>
  );
};

export default App;
