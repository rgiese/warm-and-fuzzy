import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator,
  NavigationScreenConfigProps,
  NavigationScreenOptions,
} from "react-navigation";

import ScreenProps from "./ScreenProps";

import AuthLoadingScreen from "./AuthLoadingScreen";
import AuthScreen from "./AuthScreen";
import AccountScreen from "./AccountScreen";
import HomeScreen from "./HomeScreen";
import LatestValuesScreen from "./LatestValuesScreen";

// App screens
const AppNavigator = createStackNavigator(
  {
    [HomeScreen.routeName]: { screen: HomeScreen },
    [LatestValuesScreen.routeName]: { screen: LatestValuesScreen },
    [AccountScreen.routeName]: { screen: AccountScreen },
  },
  {
    initialRouteName: HomeScreen.routeName,
    defaultNavigationOptions: (
      navigationOptionsContainer: NavigationScreenConfigProps
    ): NavigationScreenOptions => {
      const screenProps = navigationOptionsContainer.screenProps as ScreenProps;
      const colors = screenProps.theme.colors;

      return {
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
      };
    },
  }
);

// Auth flow screens
const AuthNavigator = createStackNavigator(
  {
    [AuthScreen.routeName]: AuthScreen,
  },
  {
    defaultNavigationOptions: {
      header: null,
    },
  }
);

// Stitch together app and auth flow
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

// Create top-level container
const NavigationAppContainer = createAppContainer(RootNavigator);

export default NavigationAppContainer;
