import {
  createAppContainer,
  createSwitchNavigator,
  NavigationParams,
  NavigationRoute,
  NavigationScreenConfigProps,
} from "react-navigation";

import {
  createStackNavigator,
  NavigationStackOptions,
  NavigationStackProp,
} from "react-navigation-stack";

import ScreenProps from "./ScreenProps";

import AuthScreen from "./AuthScreen";
import AccountScreen from "./AccountScreen";
import HomeScreen from "./HomeScreen";
import ThermostatSettingsScreen from "../thermostatSettings/ThermostatSettingsScreen";
import ThermostatSettingScreen from "../thermostatSettings/ThermostatSettingScreen";

import ScreenRoutes from "./ScreenRoutes";

// App screens
const AppNavigator = createStackNavigator(
  {
    [ScreenRoutes.Home]: { screen: HomeScreen },
    [ScreenRoutes.Account]: { screen: AccountScreen },
    [ScreenRoutes.ThermostatSettings]: { screen: ThermostatSettingsScreen },
    [ScreenRoutes.ThermostatSetting]: { screen: ThermostatSettingScreen },
  },
  {
    initialRouteName: ScreenRoutes.Home,
    defaultNavigationOptions: (
      navigationOptionsContainer: NavigationScreenConfigProps<
        NavigationStackProp<NavigationRoute<NavigationParams>>
      >
    ): NavigationStackOptions => {
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
      headerShown: false,
    },
  }
);

// Stitch together app and auth flow
const RootNavigator = createSwitchNavigator(
  {
    App: AppNavigator,
    Auth: AuthNavigator,
  },
  {
    initialRouteName: ScreenRoutes.Auth,
  }
);

// Create top-level container
const NavigationAppContainer = createAppContainer(RootNavigator);

export default NavigationAppContainer;
