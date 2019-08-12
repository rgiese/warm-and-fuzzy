import React from "react";
import { Provider as PaperProvider, DarkTheme } from "react-native-paper";

import { ApolloProvider } from "react-apollo";
import ApolloClient from "./services/ApolloClient";

import Screens from "./screens";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {}

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public render(): React.ReactElement {
    return (
      <PaperProvider theme={DarkTheme}>
        <ApolloProvider client={ApolloClient}>
          <Screens />
        </ApolloProvider>
      </PaperProvider>
    );
  }
}

export default App;
