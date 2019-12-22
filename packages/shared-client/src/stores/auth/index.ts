import { action, computed, observable } from "mobx";
import JwtDecode from "jwt-decode";

import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

import { AuthProvider } from "./AuthProvider";

type AuthStoreState = "initializing" | "authenticating" | "unauthenticated" | "authenticated";

export class AuthStore {
  @observable state: AuthStoreState;

  @observable accessToken?: string = undefined;
  @observable tenant?: string = undefined;
  @observable userName?: string = undefined;
  @observable userEmail?: string = undefined;
  readonly userPermissions = observable.array<string>([]);

  authProvider: AuthProvider;

  public constructor(authProvider: AuthProvider, initialState: AuthStoreState = "unauthenticated") {
    this.state = initialState;
    this.authProvider = authProvider;
  }

  @computed get isUserAuthenticated(): boolean {
    return this.state === "authenticated";
  }

  @action onUserLoggingIn(): void {
    this.state = "authenticating";
  }

  @action
  public onUserLoggedIn(accessToken: string, idToken: string): void {
    this.state = "authenticated";

    this.accessToken = accessToken;

    const decodedAccessToken = JwtDecode(accessToken) as any;
    const decodedIdToken = JwtDecode(idToken) as any;

    this.tenant =
      decodedAccessToken[
        AuthenticationConfiguration.CustomClaimsNamespace +
          AuthenticationConfiguration.CustomClaims.Tenant
      ];

    this.userName =
      decodedIdToken[
        AuthenticationConfiguration.CustomClaimsNamespace +
          AuthenticationConfiguration.CustomClaims.UserName
      ];

    this.userEmail =
      decodedIdToken[
        AuthenticationConfiguration.CustomClaimsNamespace +
          AuthenticationConfiguration.CustomClaims.UserEmail
      ];

    this.userPermissions.replace(decodedAccessToken["permissions"]);
  }

  @action
  public onUserLoggedOut(): void {
    this.accessToken = undefined;
    this.tenant = undefined;
    this.userName = undefined;
    this.userEmail = undefined;
    this.userPermissions.clear();

    this.state = "unauthenticated";
  }
}
