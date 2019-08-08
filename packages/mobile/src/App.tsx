import React from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import { ApolloProvider } from "react-apollo";

import { ConfigStageName } from "./config";

import { GlobalAuth } from "./services/Auth";
import ApolloClient from "./services/ApolloClient";

import LatestValues from "./components/LatestValues";

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {
  public hasInitialized: boolean;
  public isAuthenticated: boolean;

  public constructor() {
    this.hasInitialized = false;
    this.isAuthenticated = false;
  }
}

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public async componentDidMount(): Promise<void> {
    await GlobalAuth.initialize();
    this.setState({ hasInitialized: true, isAuthenticated: await GlobalAuth.IsAuthenticated });
  }

  private handleLogin = async (): Promise<void> => {
    this.setState({ isAuthenticated: await GlobalAuth.login() });
  };

  private handleLogout = async (): Promise<void> => {
    await GlobalAuth.logout();
    ApolloClient.resetStore();
    this.setState({ isAuthenticated: false });
  };

  public render(): React.ReactElement {
    return (
      <ApolloProvider client={ApolloClient}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
            <View style={styles.body}>
              <ActivityIndicator
                size="large"
                color="#05a5d1"
                animating={!this.state.hasInitialized}
              />
              {this.state.hasInitialized && (
                <View style={styles.sectionContainer}>
                  <Text>Stage: {ConfigStageName}</Text>
                  <Text style={styles.sectionTitle}>Step One</Text>
                  <Text style={styles.sectionDescription}>
                    Edit <Text style={styles.highlight}>App.tsx</Text> to change this screen and
                    then come back to see your edits.
                  </Text>
                  {this.state.isAuthenticated ? (
                    <>
                      <Text>
                        You are logged in, {GlobalAuth.UserName}. Your permissions: [
                        {GlobalAuth.Permissions.join(", ")}]
                        <LatestValues />
                      </Text>
                      <Button title="Log out" onPress={this.handleLogout} />
                    </>
                  ) : (
                    <Button title="Log in" onPress={this.handleLogin} />
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ApolloProvider>
    );
  }
}

export default App;
