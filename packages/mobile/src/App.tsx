import React from "react";
import { YellowBox } from "react-native";
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
    Home: { screen: HomeScreen },
    LatestValues: { screen: LatestValuesScreen },
    Account: { screen: AccountScreen },
  },
  {
    initialRouteName: "Home",
  }
);

const AuthNavigator = createStackNavigator({
  Auth: AuthScreen,
});

const RootNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppNavigator,
    Auth: AuthNavigator,
  },
  {
    initialRouteName: "AuthLoading",
  }
);

// Temporary silencing of warnings until react-native-gesture-handler updates past 1.1.3
// https://github.com/react-navigation/react-navigation/issues/6143
// https://github.com/kmagiera/react-native-gesture-handler/issues/683
YellowBox.ignoreWarnings(["Warning: componentWillUpdate is deprecated"]);

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
