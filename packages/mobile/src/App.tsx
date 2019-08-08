import React from "react";
import { createAppContainer, createStackNavigator } from "react-navigation";
import { Provider as PaperProvider, DarkTheme } from "react-native-paper";

import { ApolloProvider } from "react-apollo";
import ApolloClient from "./services/ApolloClient";

import { GlobalAuth } from "./services/Auth";

//import { ConfigStageName } from "./config";

import HomeScreen from "./screens/HomeScreen";
import LatestValuesScreen from "./screens/LatestValuesScreen";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {
  public hasInitialized: boolean;
  public isAuthenticated: boolean;

  public constructor() {
    this.hasInitialized = false;
    this.isAuthenticated = false;
  }
}

const RootStack = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    LatestValues: { screen: LatestValuesScreen },
  },
  {
    initialRouteName: "Home",
  }
);

const NavigationAppContainer = createAppContainer(RootStack);

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public async componentDidMount(): Promise<void> {
    await GlobalAuth.initialize();
    this.setState({ hasInitialized: true, isAuthenticated: await GlobalAuth.IsAuthenticated });
  }
  /*
  private handleLogin = async (): Promise<void> => {
    this.setState({ isAuthenticated: await GlobalAuth.login() });
  };

  private handleLogout = async (): Promise<void> => {
    await GlobalAuth.logout();
    ApolloClient.resetStore();
    this.setState({ isAuthenticated: false });
  };
*/
  public render(): React.ReactElement {
    return (
      <PaperProvider theme={DarkTheme}>
        <ApolloProvider client={ApolloClient}>
          <NavigationAppContainer />
        </ApolloProvider>
      </PaperProvider>
    );
  }
}

export default App;
