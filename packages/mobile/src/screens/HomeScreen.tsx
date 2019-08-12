import React from "react";
import { Button, Text, View } from "react-native";
import { IconButton, Colors } from "react-native-paper";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
  NavigationRoute,
} from "react-navigation";

import AccountScreen from "./AccountScreen";
import LatestValuesScreen from "./LatestValuesScreen"

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
  }: {
    navigation: NavigationScreenProp<NavigationRoute<Params>, Params>;
  }): NavigationStackScreenOptions => ({
    title: "Home",
    headerRight: (
      <IconButton
        onPress={() => navigation.navigate(AccountScreen.routeName)}
        color={Colors.grey700}
        icon="person"
      />
    ),
  });

  public render(): React.ReactElement {
    return (
      <View>
        <Text>Hello, you're logged in.</Text>
        <Button
          title="Go to latest values"
          onPress={(): void => {
            this.props.navigation.navigate(LatestValuesScreen.routeName);
          }}
        />
      </View>
    );
  }
}

export default HomeScreen;
