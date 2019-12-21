import React from "react";
import { Provider as PaperProvider } from "react-native-paper";

import { configure as MobxConfigure } from "mobx";

import { GlobalAuth } from "./services/Auth";

import { RootStore } from "./stores/RootStore";
import RootStoreContext from "./stores/RootStoreContext";

import ScreenProps from "./screens/ScreenProps";
import Screens from "./screens";

import AppTheme from "./Theme";

// App-wide MobX configuration
MobxConfigure({ enforceActions: "observed" });

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {}

const rootStore = new RootStore();
GlobalAuth.setAuthStore(rootStore.authStore);

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public render(): React.ReactElement {
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
  }
}

export default App;
