import React from "react";
import { IconButton } from "react-native-paper";
import { NavigationScreenProp, NavigationState, NavigationRoute } from "react-navigation";
import { NavigationStackOptions } from "react-navigation-stack";

import BaseView from "../components/BaseView";
import ThermostatStatusTable from "../components/ThermostatStatusTable";

import ScreenProps from "./ScreenProps";
import ScreenRoutes from "./ScreenRoutes";

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

  public static navigationOptions = ({
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

  public render(): React.ReactElement {
    return (
      <BaseView>
        <ThermostatStatusTable />
      </BaseView>
    );
  }
}

export default HomeScreen;
