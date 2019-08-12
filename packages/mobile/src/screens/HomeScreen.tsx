import React from "react";
import { Button, Text, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import Header from "../components/Header";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {
  public constructor() {}
}

class HomeScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public static navigationOptions: NavigationStackScreenOptions = {
    title: "Home SSO Title",
  };

  public render(): React.ReactElement {
    return (
      <View>
        <Header {...this.props} title={HomeScreen.navigationOptions.title} />
        <Text>Hello, you're logged in.</Text>
        <Button
          title="Go to latest values"
          onPress={(): void => {
            this.props.navigation.navigate("LatestValues");
          }}
        />
      </View>
    );
  }
}

export default HomeScreen;
