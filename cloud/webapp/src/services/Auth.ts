import Auth0 from "auth0-js";
import JwtDecode from "jwt-decode";

import History from "./History";

import { AUTH_CONFIG } from "./auth0-variables";

const localStorageKeys = {
  expiresAt: "auth.expiresAt",
  accessToken: "auth.accessToken",
  idToken: "auth.idToken",
};

class Auth {
  private tokenRenewalTimeout: any;

  private auth0 = new Auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientID,
    redirectUri: window.location.origin + AUTH_CONFIG.callbackRoute,
    audience: AUTH_CONFIG.audience,
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

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult): void => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        History.replace("/home");
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
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
    return decodedIdToken[AUTH_CONFIG.customClaimsNamespace + "user_name"];
  }

  public get UserEmail(): string | undefined {
    const idToken = this.IdToken;

    if (idToken === null) {
      return undefined;
    }

    const decodedIdToken = JwtDecode(idToken) as any;
    return decodedIdToken[AUTH_CONFIG.customClaimsNamespace + "user_email"];
  }

  private setSession(authResult: any): void {
    // Set the time that the access token will expire at
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    localStorage.setItem(localStorageKeys.accessToken, authResult.accessToken);
    localStorage.setItem(localStorageKeys.idToken, authResult.idToken);
    localStorage.setItem(localStorageKeys.expiresAt, expiresAt.toString());

    // Schedule token renewal
    this.scheduleRenewal();

    // Navigate to the home route
    History.replace("/home");
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

    // navigate to the home route
    History.replace("/home");
  }

  private scheduleRenewal(): void {
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
