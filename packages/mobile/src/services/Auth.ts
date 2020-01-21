import * as Keychain from "react-native-keychain";

import Auth0 from "react-native-auth0";
import { AuthStore } from "@grumpycorp/warm-and-fuzzy-shared-client";
import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

interface AuthResult {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

//
// We use (abuse?) Keychain.setGenericPassword by storing our tokens concatenated as [accessToken,idToken,expiresIn]
// under a single user name (KeychainUserName) and service (i.e. the default one).
// This feels more transactional than storing the tokens as separate Keychain services, for better or worse.
// See Auth#initialize and Auth#setSession.
//
const KeychainUserName = "waf";
const KeychainTokenSeparator = ",";

//
// Note: refresh logic (timers) won't work in React Native since long-running timers
//       aren't really a thing in React Native/Android/etc.
//

export default class Auth {
  private readonly auth0 = new Auth0({
    domain: AuthenticationConfiguration.Domain,
    clientId: AuthenticationConfiguration.ClientId,
  });

  private authStore?: AuthStore = undefined;

  public async initializeStore(authStore: AuthStore): Promise<void> {
    this.authStore = authStore;

    // Apply state from keychain
    const savedTokens = await Keychain.getGenericPassword();

    if (!savedTokens || savedTokens.username !== KeychainUserName) {
      authStore.onUserLoggedOut();
      return;
    }

    const [accessToken, idToken, expiresAtAsString] = savedTokens.password.split(
      KeychainTokenSeparator
    );
    const expiresAt = Number.parseInt(expiresAtAsString);

    const isExpired = new Date().getTime() > expiresAt;

    if (!isExpired) {
      this.authStore?.onUserLoggedIn(accessToken, idToken);
    } else {
      authStore.onUserLoggedOut();
    }
  }

  //
  // AuthProvider implementation
  //

  public async requestLogin(): Promise<boolean | undefined> {
    this.authStore?.onUserLoggingIn();

    const authResult = await this.auth0.webAuth.authorize({
      scope: "openid",
      audience: AuthenticationConfiguration.Audience,
    });

    if (authResult.expiresIn && authResult.accessToken && authResult.idToken) {
      await this.setSession(authResult);
      return true;
    } else {
      console.log("Authentication failure:");
      console.log(authResult);
      this.authStore?.onUserLoggedOut();
    }

    return false;
  }

  // ...because of interface definition...
  // eslint-disable-next-line @typescript-eslint/require-await
  public async completeLogin(): Promise<boolean> {
    // No-op
    return false;
  }

  public async requestLogout(): Promise<void> {
    try {
      await Keychain.resetGenericPassword();
      await this.auth0.webAuth.clearSession();
    } catch (e) {
      if (e.error === "a0.session.user_cancelled") {
        // Successfully logged out (expected exception)
      } else {
        throw e;
      }
    } finally {
      this.authStore?.onUserLoggedOut();
    }
  }

  //
  // Internals
  //

  private async setSession(authResult: AuthResult): Promise<void> {
    // Set the time that the access token will expire at
    const accessToken = authResult.accessToken;
    const idToken = authResult.idToken;
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    await Keychain.setGenericPassword(
      KeychainUserName,
      [accessToken, idToken, expiresAt.toString()].join(KeychainTokenSeparator)
    );

    this.authStore?.onUserLoggedIn(accessToken, idToken);
  }
}
