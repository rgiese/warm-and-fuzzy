import React from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
} from "react-native";
import { Provider as PaperProvider ,DarkTheme } from "react-native-paper";
import { ApolloProvider } from "react-apollo";

import { ConfigStageName } from "./config";

import { GlobalAuth } from "./services/Auth";
import ApolloClient from "./services/ApolloClient";

import LatestValues from "./components/LatestValues";

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
      <PaperProvider theme={DarkTheme}>
        <ApolloProvider client={ApolloClient}>
          <StatusBar barStyle="dark-content" />
          <SafeAreaView>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
              <View>
                <ActivityIndicator
                  size="large"
                  color="#05a5d1"
                  animating={!this.state.hasInitialized}
                />
                {this.state.hasInitialized && (
                  <View>
                    <Text>Stage: {ConfigStageName}</Text>
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
      </PaperProvider>
    );
  }
}

export default App;
