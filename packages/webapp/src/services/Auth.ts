import Auth0 from "auth0-js";
import JwtDecode from "jwt-decode";

import Config from "../config";

import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

const localStorageKeys = {
  expiresAt: "auth.expiresAt",
  accessToken: "auth.accessToken",
  idToken: "auth.idToken",
};

class Auth {
  private tokenRenewalTimeout: any;

  private auth0 = new Auth0.WebAuth({
    domain: AuthenticationConfiguration.Domain,
    clientID: AuthenticationConfiguration.ClientId,
    redirectUri: window.location.origin + Config.auth0.callbackRoute,
    audience: AuthenticationConfiguration.Audience,
    responseType: "token id_token",
    scope: "openid",
  });

  public constructor() {
    // Schedule token renewal if we're still logged in from localStorage
    this.scheduleRenewal();
  }

  public login(): void {
    this.auth0.authorize();
  }

  public async handleAuthentication(): Promise<boolean> {
    // Called in response to the universal auth page redirecting to our /callback

    return new Promise((resolve, reject): void => {
      // Promise-ify Auth0's API
      this.auth0.parseHash((err, authResult): void => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve(this.IsAuthenticated);
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

  public get ExpiresAt(): number {
    const storedValue = localStorage.getItem(localStorageKeys.expiresAt);

    if (storedValue === null) {
      return 0;
    }

    return Number(storedValue);
  }

  public get IsAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    return new Date().getTime() < this.ExpiresAt;
  }

  public get AccessToken(): string | null {
    return localStorage.getItem(localStorageKeys.accessToken);
  }

  public get IdToken(): string | null {
    return localStorage.getItem(localStorageKeys.idToken);
  }

  public get UserName(): string | undefined {
    const idToken = this.IdToken;

    if (idToken === null) {
      return undefined;
    }

    const decodedIdToken = JwtDecode(idToken) as any;
    return decodedIdToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.UserName
    ];
  }

  public get UserEmail(): string | undefined {
    const idToken = this.IdToken;

    if (idToken === null) {
      return undefined;
    }

    const decodedIdToken = JwtDecode(idToken) as any;
    return decodedIdToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.UserEmail
    ];
  }

  public get Tenant(): string | undefined {
    const accessToken = this.AccessToken;

    if (accessToken === null) {
      return undefined;
    }

    const decodedAccessToken = JwtDecode(accessToken) as any;
    return decodedAccessToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.Tenant
    ];
  }

  public get Permissions(): string[] {
    const accessToken = this.AccessToken;

    if (accessToken === null) {
      return [];
    }

    const decodedAccessToken = JwtDecode(accessToken) as any;
    return decodedAccessToken["permissions"];
  }

  private setSession(authResult: any): void {
    // Set the time that the access token will expire at
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    localStorage.setItem(localStorageKeys.accessToken, authResult.accessToken);
    localStorage.setItem(localStorageKeys.idToken, authResult.idToken);
    localStorage.setItem(localStorageKeys.expiresAt, expiresAt.toString());

    // Schedule token renewal
    this.scheduleRenewal();
  }

  public logout(): void {
    // Clear token renewal
    clearTimeout(this.tokenRenewalTimeout);

    // Remove tokens and expiry time
    localStorage.removeItem(localStorageKeys.accessToken);
    localStorage.removeItem(localStorageKeys.idToken);
    localStorage.removeItem(localStorageKeys.expiresAt);

    this.auth0.logout({
      returnTo: window.location.origin,
    });
  }

  private scheduleRenewal(): void {
    if (this.tokenRenewalTimeout) {
      clearTimeout(this.tokenRenewalTimeout);
    }

    const timeout = this.ExpiresAt - Date.now();

    if (timeout > 0) {
      this.tokenRenewalTimeout = setTimeout((): void => {
        this.renewSession();
      }, timeout);
    }
  }

  private renewSession(): void {
    this.auth0.checkSession({}, (err, authResult): void => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        this.logout();
        console.log(err);
        alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
      }
    });
  }
}

export let GlobalAuth = new Auth();
