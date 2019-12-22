import React from "react";
import { IconButton } from "react-native-paper";
import { NavigationScreenProp, NavigationRoute } from "react-navigation";
import { NavigationStackOptions, NavigationStackScreenComponent } from "react-navigation-stack";

import BaseView from "../components/BaseView";
import ThermostatStatusTable from "../components/ThermostatStatusTable";

import ScreenProps from "./ScreenProps";
import ScreenRoutes from "./ScreenRoutes";

const HomeScreen: NavigationStackScreenComponent<{}> = ({}): React.ReactElement => {
  return (
    <BaseView>
      <ThermostatStatusTable />
    </BaseView>
  );
};

interface Params {}

HomeScreen.navigationOptions = ({
  navigation,
  screenProps,
}: {
  navigation: NavigationScreenProp<NavigationRoute<Params>, Params>;
  screenProps: any;
}): NavigationStackOptions => ({
  title: "Home",
  headerRight: (
    <IconButton
      onPress={(): void => {
        navigation.navigate(ScreenRoutes.Account);
      }}
      color={(screenProps as ScreenProps).theme.colors.text}
      icon="account"
    />
  ),
});

export default HomeScreen;
