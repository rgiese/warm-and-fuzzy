import React from "react";
import { IconButton } from "react-native-paper";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
  NavigationRoute,
} from "react-navigation";

import ScreenProps from "./ScreenProps";

import AccountScreen from "./AccountScreen";

import BaseView from "../components/BaseView";
import ThermostatStatusTable from "../components/ThermostatStatusTable";

interface Params {}

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {}

class HomeScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public static routeName = "Home";

  public static navigationOptions = ({
    navigation,
    screenProps,
  }: {
    navigation: NavigationScreenProp<NavigationRoute<Params>, Params>;
    screenProps: ScreenProps;
  }): NavigationStackScreenOptions => ({
    title: "Home",
    headerRight: (
      <IconButton
        onPress={() => navigation.navigate(AccountScreen.routeName)}
        color={screenProps.theme.colors.text}
        icon="person"
      />
    ),
  });

  public render(): React.ReactElement {
    return (
      <BaseView>
        <ThermostatStatusTable />
      </BaseView>
    );
  }
}

export default HomeScreen;
