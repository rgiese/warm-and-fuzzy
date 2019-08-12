import React from "react";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationStackScreenOptions,
} from "react-navigation";

import BaseView from "../components/BaseView";
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
      <BaseView>
        <LatestValues />
      </BaseView>
    );
  }
}

export default LatestValuesScreen;
