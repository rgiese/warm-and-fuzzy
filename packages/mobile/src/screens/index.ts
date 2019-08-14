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

import ScreenRoutes from "./ScreenRoutes";

// App screens
const AppNavigator = createStackNavigator(
  {
    [ScreenRoutes.Home]: { screen: HomeScreen },
    [ScreenRoutes.Account]: { screen: AccountScreen },
  },
  {
    initialRouteName: ScreenRoutes.Home,
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
    [ScreenRoutes.Auth]: AuthScreen,
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
    [ScreenRoutes.AuthLoading]: AuthLoadingScreen,
    App: AppNavigator,
    Auth: AuthNavigator,
  },
  {
    initialRouteName: ScreenRoutes.AuthLoading,
  }
);

// Create top-level container
const NavigationAppContainer = createAppContainer(RootNavigator);

export default NavigationAppContainer;
