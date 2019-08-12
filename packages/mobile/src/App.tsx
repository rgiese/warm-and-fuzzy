import React from "react";
import { createAppContainer, createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Provider as PaperProvider, DarkTheme } from "react-native-paper";

import { ApolloProvider } from "react-apollo";
import ApolloClient from "./services/ApolloClient";

import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import AuthScreen from "./screens/AuthScreen";
import AccountScreen from "./screens/AccountScreen";
import HomeScreen from "./screens/HomeScreen";
import LatestValuesScreen from "./screens/LatestValuesScreen";

//
// Set up navigation
//

const AppNavigator = createStackNavigator(
  {
    [HomeScreen.routeName]: { screen: HomeScreen },
    [LatestValuesScreen.routeName]: { screen: LatestValuesScreen },
    [AccountScreen.routeName]: { screen: AccountScreen },
  },
  {
    initialRouteName: HomeScreen.routeName,
  }
);

const AuthNavigator = createStackNavigator({
  [AuthScreen.routeName]: AuthScreen,
});

const RootNavigator = createSwitchNavigator(
  {
    [AuthLoadingScreen.routeName]: AuthLoadingScreen,
    App: AppNavigator,
    Auth: AuthNavigator,
  },
  {
    initialRouteName: AuthLoadingScreen.routeName,
  }
);

const NavigationAppContainer = createAppContainer(RootNavigator);

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
          <NavigationAppContainer />
        </ApolloProvider>
      </PaperProvider>
    );
  }
}

export default App;
