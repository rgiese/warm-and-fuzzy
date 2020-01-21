import {
  NavigationScreenConfigProps,
  createAppContainer,
  createSwitchNavigator,
} from "react-navigation";
import {
  NavigationStackOptions,
  NavigationStackProp,
  createStackNavigator,
} from "react-navigation-stack";

import AccountScreen from "./AccountScreen";
import AuthScreen from "./AuthScreen";
import HomeScreen from "./HomeScreen";
import ScreenProps from "./ScreenProps";
import ScreenRoutes from "./ScreenRoutes";
import ThermostatSettingScreen from "../thermostatSettings/ThermostatSettingScreen";
import ThermostatSettingsScreen from "../thermostatSettings/ThermostatSettingsScreen";

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
      navigationOptionsContainer: NavigationScreenConfigProps<NavigationStackProp>
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
