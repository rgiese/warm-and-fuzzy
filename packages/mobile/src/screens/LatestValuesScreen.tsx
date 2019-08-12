import React from "react";
import { Button, Text, View } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import { GlobalAuth } from "../services/Auth";

import Header from "../components/Header";
import LatestValues from "../components/LatestValues";

interface Props {
  navigation: NavigationScreenProp<NavigationState>;
}

class State {
  public constructor() {}
}

class LatestValuesScreen extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  static navigationOptions: NavigationStackScreenOptions = {
    title: "Latest values",
  };

  public render(): React.ReactElement {
    return (
      <View>
        <Header {...this.props} title={LatestValuesScreen.navigationOptions.title} />
        <Text>
          You are logged in, {GlobalAuth.UserName}. Your permissions: [
          {GlobalAuth.Permissions.join(", ")}]
        </Text>
        <LatestValues />
        <Button
          title="Go home"
          onPress={(): void => {
            this.props.navigation.navigate("Home");
          }}
        />
      </View>
    );
  }
}

export default LatestValuesScreen;
