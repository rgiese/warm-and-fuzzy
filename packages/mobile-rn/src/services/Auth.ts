import Auth0 from "react-native-auth0";
import JwtDecode from "jwt-decode";
//import Keychain from "react-native-keychain";

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

class Auth {
  private auth0 = new Auth0({
    domain: AuthenticationConfiguration.Domain,
    clientId: AuthenticationConfiguration.ClientId,
  });

  private accessToken?: string;
  private decodedAccessToken?: any;

  private idToken?: string;
  private decodedIdToken?: any;

  public constructor() {
    this.accessToken = undefined;
    this.decodedAccessToken = undefined;

    this.idToken = undefined;
    this.decodedIdToken = undefined;
  }

  public async initialize(): Promise<void> {}

  //
  // Login
  //

  public async login(): Promise<boolean> {
    const credentials = await this.auth0.webAuth.authorize({
      scope: "openid",
      audience: AuthenticationConfiguration.Audience,
    });

    if (credentials.accessToken && credentials.idToken) {
      this.accessToken = credentials.accessToken;
      this.decodedAccessToken = JwtDecode(credentials.accessToken);

      this.idToken = credentials.idToken;
      this.decodedIdToken = JwtDecode(credentials.idToken);

      return true;
    } else {
        console.log('Authentication failure:');
        console.log(credentials);
    }

    return false;
  }

  //
  // Accessors
  //

  public get IsAuthenticated(): boolean {
    return this.idToken !== undefined;
  }

  public get AccessToken(): string | undefined {
    return this.accessToken;
  }

  public get IdToken(): string | undefined {
    return this.idToken;
  }

  public get UserName(): string | undefined {
    if (!this.decodedIdToken) {
      return undefined;
    }

    return this.decodedIdToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.UserName
    ];
  }

  public get UserEmail(): string | undefined {
    if (!this.decodedIdToken) {
      return undefined;
    }

    return this.decodedIdToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.UserEmail
    ];
  }

  public get Tenant(): string | undefined {
    if (!this.decodedAccessToken) {
      return undefined;
    }

    return this.decodedAccessToken[
      AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.Tenant
    ];
  }

  public get Permissions(): string[] {
    if (!this.decodedAccessToken) {
      return [];
    }

    return this.decodedAccessToken["permissions"];
  }

  //
  // Logout
  //

  public async logout(): Promise<void> {
    // TODO: log out
  }
}

export let GlobalAuth = new Auth();
