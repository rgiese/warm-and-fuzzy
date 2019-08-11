import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { DrawerItems, DrawerItemsProps, SafeAreaView } from "react-navigation";

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

  public render(): React.ReactElement {
    return (
      <ScrollView>
        <SafeAreaView style={styles.container} forceInset={{ top: "always", horizontal: "never" }}>
          <DrawerItems {...this.props} />
          <Text>Hello world.</Text>
        </SafeAreaView>
      </ScrollView>
    );
  }
}

export default Drawer;
