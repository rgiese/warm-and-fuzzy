import React from "react";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { DrawerItems, DrawerItemsProps, SafeAreaView } from "react-navigation";

import { GlobalAuth } from "../services/Auth";
import ApolloClient from "../services/ApolloClient";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends DrawerItemsProps {}

class State {}

class Drawer extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  private handleLogout = async (): Promise<void> => {
    await GlobalAuth.logout();
    ApolloClient.resetStore();

    this.props.navigation.navigate("Auth");
  };

  public render(): React.ReactElement {
    return (
      <ScrollView>
        <SafeAreaView style={styles.container} forceInset={{ top: "always", horizontal: "never" }}>
          <DrawerItems {...this.props} />
          <Text>Hello world.</Text>
          <Button title="Sign out" onPress={this.handleLogout} />
        </SafeAreaView>
      </ScrollView>
    );
  }
}

export default Drawer;
