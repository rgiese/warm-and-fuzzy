import Auth0 from "react-native-auth0";
import JwtDecode from "jwt-decode";
import * as Keychain from "react-native-keychain";

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

class Auth {
  private auth0 = new Auth0({
    domain: AuthenticationConfiguration.Domain,
    clientId: AuthenticationConfiguration.ClientId,
  });

  private accessToken?: string;
  private idToken?: string;
  private expiresAt?: number;

  public constructor() {
    this.accessToken = undefined;
    this.idToken = undefined;
    this.expiresAt = undefined;
  }

  public async initialize(): Promise<void> {
    const savedTokens = await Keychain.getGenericPassword();

    if (!savedTokens || savedTokens.username !== KeychainUserName) {
      return;
    }

    const [accessToken, idToken, expiresAt] = savedTokens.password.split(KeychainTokenSeparator);

    this.accessToken = accessToken;
    this.idToken = idToken;
    this.expiresAt = Number.parseInt(expiresAt);
  }

  //
  // Login
  //

  public async login(): Promise<boolean> {
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
    }

    return false;
  }

  //
  // Accessors
  //

  public get IsAuthenticated(): boolean {
    return this.expiresAt !== undefined && new Date().getTime() < this.expiresAt;
  }

  public get AccessToken(): string | undefined {
    return this.accessToken;
  }

  public get IdToken(): string | undefined {
    return this.idToken;
  }

  public get UserName(): string | undefined {
    if (!this.idToken) {
      return undefined;
    }

    const decodedIdToken = JwtDecode(this.idToken) as any;

    return decodedIdToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.UserName
    ];
  }

  public get UserEmail(): string | undefined {
    if (!this.idToken) {
      return undefined;
    }

    const decodedIdToken = JwtDecode(this.idToken) as any;

    return decodedIdToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.UserEmail
    ];
  }

  public get Tenant(): string | undefined {
    if (!this.accessToken) {
      return undefined;
    }

    const decodedAccessToken = JwtDecode(this.accessToken) as any;

    return decodedAccessToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.Tenant
    ];
  }

  public get Permissions(): string[] {
    if (!this.accessToken) {
      return [];
    }

    const decodedAccessToken = JwtDecode(this.accessToken) as any;

    return decodedAccessToken["permissions"];
  }

  //
  // Logout
  //

  public async logout(): Promise<void> {
    // Clear token renewal
    //clearTimeout(this.tokenRenewalTimeout);

    // Remove tokens and expiry time
    this.accessToken = undefined;
    this.idToken = undefined;
    this.expiresAt = undefined;

    await Keychain.resetGenericPassword();

    try {
      await this.auth0.webAuth.clearSession();
    } catch (e) {
      if (e.error === "a0.session.user_cancelled") {
        // Successfully logged out (expected exception)
      } else {
        throw e;
      }
    }
  }

  //
  // Internals
  //

  private async setSession(authResult: AuthResult): Promise<void> {
    // Set the time that the access token will expire at
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    await Keychain.setGenericPassword(
      KeychainUserName,
      [this.accessToken, this.idToken, this.expiresAt.toString()].join(KeychainTokenSeparator)
    );

    // Schedule token renewal
    //this.scheduleRenewal();
  }
}

export let GlobalAuth = new Auth();
