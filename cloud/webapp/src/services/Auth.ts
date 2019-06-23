import Auth0 from "auth0-js";
import JwtDecode from "jwt-decode";

import History from "./History";

import { AUTH_CONFIG } from "./auth0-variables";

class Auth {
  private accessToken: any;
  private idToken: any;
  private expiresAt: any;
  private tokenRenewalTimeout: any;

  private auth0 = new Auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientID,
    redirectUri: window.location.origin + AUTH_CONFIG.callbackRoute,
    audience: AUTH_CONFIG.audience,
    responseType: "token id_token",
    scope: "openid",
  });

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

  public get IsAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }

  public get AccessToken(): any {
    return this.accessToken;
  }

  public get IdToken(): any {
    return this.idToken;
  }

  public get UserName(): string | undefined {
    const decodedIdToken = JwtDecode(this.idToken) as any;
    return decodedIdToken[AUTH_CONFIG.customClaimsNamespace + "user_name"];
  }

  public get UserEmail(): string | undefined {
    const decodedIdToken = JwtDecode(this.idToken) as any;
    return decodedIdToken[AUTH_CONFIG.customClaimsNamespace + "user_email"];
  }

  private setSession(authResult: any): void {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem("isLoggedIn", "true");

    // Set the time that the access token will expire at
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;

    // Schedule token renewal
    this.scheduleRenewal();

    // Navigate to the home route
    History.replace("/home");
  }

  public logout(): void {
    // Clear token renewal
    clearTimeout(this.tokenRenewalTimeout);

    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem("isLoggedIn");

    this.auth0.logout({
      returnTo: window.location.origin,
    });

    // navigate to the home route
    History.replace("/home");
  }

  private scheduleRenewal(): void {
    const timeout = this.expiresAt - Date.now();
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
