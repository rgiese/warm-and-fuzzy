import React, { Fragment } from "react";
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar } from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  highlight: {
    fontWeight: "700",
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionDescription: {
    color: Colors.dark,
    fontSize: 18,
    fontWeight: "400",
    marginTop: 8,
  },
  sectionTitle: {
    color: Colors.black,
    fontSize: 24,
    fontWeight: "600",
  },
});

const App = () => {
  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit <Text style={styles.highlight}>App.tsx</Text> to change this screen and then
                come back to see your edits.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

export default App;
