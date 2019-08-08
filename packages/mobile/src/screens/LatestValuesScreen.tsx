import React from "react";
import { Button, Text, View } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { GlobalAuth } from "../services/Auth";

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

  public render(): React.ReactElement {
    return (
      <View>
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
