import { registerRootComponent } from "expo";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Hello from WarmAndFuzzy.</Text>
      </View>
    );
  }
}

export default App;

registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
