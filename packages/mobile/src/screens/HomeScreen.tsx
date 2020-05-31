import { NavigationRoute, NavigationScreenProp } from "react-navigation";
import { NavigationStackOptions, NavigationStackScreenComponent } from "react-navigation-stack";

import BaseView from "../components/BaseView";
import { IconButton } from "react-native-paper";
import React from "react";
import ScreenProps from "./ScreenProps";
import ScreenRoutes from "./ScreenRoutes";
import ThermostatStatusTable from "../components/ThermostatStatusTable";

/* ESLint believes the headerRight created below is a component. Alas. */
/* eslint-disable react/no-multi-comp */

/* ESLint also wants to see HomeScreen as a proper function component. */
/* This NavigationStack stuff is too weird to mess with it. Alas. */
/* eslint-disable react/function-component-definition */

const HomeScreen: NavigationStackScreenComponent<{}> = (): React.ReactElement => {
  return (
    <BaseView>
      <ThermostatStatusTable />
    </BaseView>
  );
};

HomeScreen.navigationOptions = ({
  navigation,
  screenProps,
}: {
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  screenProps: any;
}): NavigationStackOptions => ({
  title: "Home",
  headerRight: function(): React.ReactNode {
    return (
      <IconButton
        color={(screenProps as ScreenProps).theme.colors.text}
        icon="account"
        onPress={(): void => {
          navigation.navigate(ScreenRoutes.Account);
        }}
      />
    );
  },
});

export default HomeScreen;
