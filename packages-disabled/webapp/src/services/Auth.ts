import { AuthProvider, AuthStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import Auth0 from "auth0-js";
import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

const localStorageKeys = {
  expiresAt: "auth.expiresAt",
  accessToken: "auth.accessToken",
  idToken: "auth.idToken",
};

export default class Auth implements AuthProvider {
  private tokenRenewalTimeout: any;

  private readonly auth0 = new Auth0.WebAuth({
    domain: AuthenticationConfiguration.Domain,
    clientID: AuthenticationConfiguration.ClientId,
    redirectUri: window.location.origin + "/callback",
    audience: AuthenticationConfiguration.Audience,
    responseType: "token id_token",
    scope: "openid",
  });

  private authStore?: AuthStore = undefined;

  public initializeStore(authStore: AuthStore): void {
    this.authStore = authStore;

    // Apply state from localStorage
    const accessToken = localStorage.getItem(localStorageKeys.accessToken);
    const idToken = localStorage.getItem(localStorageKeys.idToken);
    const expiresAtAsString = localStorage.getItem(localStorageKeys.expiresAt);

    if (!(accessToken && idToken && expiresAtAsString)) {
      // Not logged in
      this.clear();
      return;
    }

    const expiresAt = Number.parseInt(expiresAtAsString);
    const isExpired = new Date().getTime() > expiresAt;

    if (isExpired) {
      // No longer logged in
      this.clear();
      return;
    }

    // Logged in
    this.authStore?.onUserLoggedIn(accessToken, idToken);

    // Schedule token renewal
    this.scheduleRenewal(expiresAt);
  }

  //
  // AuthProvider implementation
  //

  // eslint-disable-next-line @typescript-eslint/require-await
  public async requestLogin(): Promise<boolean | undefined> {
    this.auth0.authorize();
    return undefined;
  }

  public async completeLogin(): Promise<boolean> {
    // Called in response to the universal auth page redirecting to our /callback

    return new Promise((resolve, reject): void => {
      // Promise-ify Auth0's API
      this.auth0.parseHash((err, authResult): void => {
        if (authResult?.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve(true);
        } else if (err) {
          console.log(err);
          alert(`HandleAuthentication error: ${err.error}. Check the console for further details.`);
          reject(err);
        } else {
          alert(
            `HandleAuthentication error: Authentication yielded neither error nor success - huh.`
          );
          reject(false);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async requestLogout(): Promise<void> {
    this.clear();

    this.auth0.logout({
      returnTo: window.location.origin,
    });

    this.authStore?.onUserLoggedOut();
  }

  //
  // Internals
  //

  private clearTimeout(): void {
    if (this.tokenRenewalTimeout) {
      clearTimeout(this.tokenRenewalTimeout);
      this.tokenRenewalTimeout = undefined;
    }
  }

  private clear(): void {
    this.clearTimeout();

    localStorage.removeItem(localStorageKeys.accessToken);
    localStorage.removeItem(localStorageKeys.idToken);
    localStorage.removeItem(localStorageKeys.expiresAt);
  }

  private setSession(authResult: any): void {
    // Set the time that the access token will expire at
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    localStorage.setItem(localStorageKeys.accessToken, authResult.accessToken);
    localStorage.setItem(localStorageKeys.idToken, authResult.idToken);
    localStorage.setItem(localStorageKeys.expiresAt, expiresAt.toString());

    // Schedule token renewal
    this.scheduleRenewal(expiresAt);

    // Update store
    this.authStore?.onUserLoggedIn(authResult.accessToken, authResult.idToken);
  }

  private scheduleRenewal(expiresAt: number): void {
    this.clearTimeout();

    const timeout = expiresAt - Date.now();

    if (timeout > 0) {
      this.tokenRenewalTimeout = setTimeout((): void => {
        this.renewSession();
      }, timeout);
    }
  }

  private renewSession(): void {
    this.auth0.checkSession({}, (err, authResult): void => {
      if (authResult?.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.requestLogout();
        console.log(err);
        alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
      }
    });
  }
}
