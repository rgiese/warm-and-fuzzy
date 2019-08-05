import { registerRootComponent } from "expo";
import { InitialProps } from "expo/build/launch/withExpoRoot.types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const $backgroundColor = "white";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: $backgroundColor,
    flex: 1,
    justifyContent: "center",
  },
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends InitialProps {}

class State {}

class App extends React.Component<Props, State> {
  public render(): React.ReactElement {
    return (
      <View style={styles.container}>
        <Text>Hello from WarmAndFuzzy.</Text>
      </View>
    );
  }
}

registerRootComponent(App);

export default App;
