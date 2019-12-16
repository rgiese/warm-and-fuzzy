import React from "react";
import { Provider as PaperProvider } from "react-native-paper";

import { ApolloProvider } from "react-apollo";
import { configure as MobxConfigure } from "mobx";

import ApolloClient from "./services/ApolloClient";

import ScreenProps from "./screens/ScreenProps";
import Screens from "./screens";

import AppTheme from "./Theme";

// App-wide MobX configuration
MobxConfigure({ enforceActions: "observed" });

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {}

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
        <ApolloProvider client={ApolloClient}>
          <Screens screenProps={screenProps} />
        </ApolloProvider>
      </PaperProvider>
    );
  }
}

export default App;
