import React, { Fragment } from "react";
import { Button, SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

import Auth0 from "react-native-auth0";
import JwtDecode from "jwt-decode";

//import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

const AuthenticationConfiguration = {
  Domain: "grumpycorp.auth0.com",
  Audience: "https://api.warmandfuzzy.house",
  CustomClaimsNamespace: "https://warmandfuzzy.house/",
  CustomClaims: {
    // Id token
    UserName: "user_name",
    UserEmail: "user_email",
    // Access token
    Tenant: "tenant",
  },
  ClientId: "d2iox6iU52feMZVugq4GIiu0A4wKe70J",
};

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
  public isAuthenticated: boolean;

  public accessToken?: string;
  public idToken?: string;
  public decodedIdToken?: any;

  public constructor() {
    this.isAuthenticated = false;

    this.accessToken = undefined;
    this.idToken = undefined;
    this.decodedIdToken = undefined;
  }
}

const auth0 = new Auth0({
  domain: AuthenticationConfiguration.Domain,
  clientId: AuthenticationConfiguration.ClientId,
});

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  private handleLogin = async (): Promise<void> => {
    const credentials = await auth0.webAuth.authorize({
      scope: "openid",
      audience: AuthenticationConfiguration.Audience,
    });

    if (credentials.accessToken && credentials.idToken) {
      this.setState({
        isAuthenticated: true,
        accessToken: credentials.accessToken,
        idToken: credentials.idToken,
        decodedIdToken: JwtDecode(credentials.idToken) as any,
      });
    }

    console.log(credentials);
  };

  public render(): React.ReactElement {
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
                {this.state.isAuthenticated ? (
                  <Text>
                    You are logged in,{" "}
                    {
                      this.state.decodedIdToken[
                        AuthenticationConfiguration.CustomClaimsNamespace + "user_name"
                      ]
                    }
                    .
                  </Text>
                ) : (
                  <Button title="Log in" onPress={this.handleLogin} />
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default App;
