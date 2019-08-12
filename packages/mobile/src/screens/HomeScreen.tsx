import React from "react";
import { Button, IconButton, Paragraph } from "react-native-paper";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
  NavigationRoute,
} from "react-navigation";

import ScreenProps from "./ScreenProps";

import AccountScreen from "./AccountScreen";
import LatestValuesScreen from "./LatestValuesScreen";

import BaseView from "../components/BaseView";

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
        <Paragraph>Hello, you're logged in.</Paragraph>
        <Button
          onPress={(): void => {
            this.props.navigation.navigate(LatestValuesScreen.routeName);
          }}
        >
          Go to latest values
        </Button>
      </BaseView>
    );
  }
}

export default HomeScreen;
