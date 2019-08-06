import { AuthSession, registerRootComponent } from "expo";
import { InitialProps } from "expo/build/launch/withExpoRoot.types";
import React from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

import JwtDecode from "jwt-decode";
import { getRandomBytesAsync } from "expo-random";
import nanoidFormat from "nanoid/async/format";
import nanoidUrl from "nanoid/url";

import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

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

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  private toQueryString(params: object): string {
    return Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  }

  private handleLogin = async (): Promise<void> => {
    // Build query URL for call to Auth0
    const queryParams = {
      client_id: AuthenticationConfiguration.ClientId,
      redirect_uri: AuthSession.getRedirectUrl(),
      audience: AuthenticationConfiguration.Audience,
      response_type: "token id_token",
      scope: "openid",
      nonce: await nanoidFormat(
        async (bytes: number): Promise<number[]> => {
          const randomData = await getRandomBytesAsync(bytes);
          return Array.from(randomData);
        },
        nanoidUrl,
        21
      ),
    };

    const authUrl = `https://${AuthenticationConfiguration.Domain}/authorize?${this.toQueryString(
      queryParams
    )}`;

    // Call Auth0 via built-in browser
    const authResponse = await AuthSession.startAsync({ authUrl });

    //console.log(authResponse);

    // Process response
    if (authResponse.type !== "success") {
      return;
    }

    if (authResponse.params.error) {
      console.log(
        `Authentication error: ${authResponse.params.error}: ${authResponse.params.error_description}`
      );

      Alert.alert("Authentication error", authResponse.params.error_description || "Unknown error");
      return;
    }

    console.log(authResponse);

    const accessToken = authResponse.params.access_token as string;
    const idToken = authResponse.params.id_token as string;

    const decodedIdToken = JwtDecode(idToken) as any;

    if (decodedIdToken.nonce !== queryParams.nonce) {
      Alert.alert("Authentication error", "Auth nonce did not match.");
      return;
    }

    this.setState({
      isAuthenticated: true,
      accessToken,
      idToken,
      decodedIdToken,
    });
  };

  public render(): React.ReactElement {
    return (
      <View style={styles.container}>
        <Text>Hello from WarmAndFuzzy.</Text>
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
    );
  }
}

registerRootComponent(App);

export default App;
