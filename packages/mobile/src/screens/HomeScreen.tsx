import React from "react";
import { Button, Text, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

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

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Home",
  };

  public render(): React.ReactElement {
    return (
      <View>
        <Text>Hello</Text>
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
