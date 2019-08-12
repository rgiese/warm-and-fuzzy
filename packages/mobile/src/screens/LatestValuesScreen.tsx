import React from "react";
import { View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import LatestValues from "../components/LatestValues";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {}

class LatestValuesScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public static routeName = "LatestValues";

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Latest values",
  };

  public render(): React.ReactElement {
    return (
      <View>
        <LatestValues />
      </View>
    );
  }
}

export default LatestValuesScreen;
