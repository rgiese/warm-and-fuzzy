import { action, computed, observable } from "mobx";

import { AuthProvider } from "./AuthProvider";
import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";
import JwtDecode from "jwt-decode";

type AuthStoreState = "initializing" | "authenticating" | "unauthenticated" | "authenticated";

export class AuthStore {
  @observable public state: AuthStoreState;

  @observable public accessToken?: string = undefined;
  @observable public tenant?: string = undefined;
  @observable public userName?: string = undefined;
  @observable public userEmail?: string = undefined;
  public readonly userPermissions = observable.array<string>([]);

  public authProvider: AuthProvider;

  public constructor(authProvider: AuthProvider, initialState: AuthStoreState = "unauthenticated") {
    this.state = initialState;
    this.authProvider = authProvider;
  }

  @computed public get isUserAuthenticated(): boolean {
    return this.state === "authenticated";
  }

  @action public onUserLoggingIn(): void {
    this.state = "authenticating";
  }

  @action
  public onUserLoggedIn(accessToken: string, idToken: string): void {
    this.state = "authenticated";

    this.accessToken = accessToken;

    // Access token
    const decodedAccessToken = JwtDecode<any>(accessToken);

    this.tenant =
      decodedAccessToken[
        AuthenticationConfiguration.CustomClaimsNamespace +
          AuthenticationConfiguration.CustomClaims.Tenant
      ];

    this.userPermissions.replace(decodedAccessToken["permissions"]);

    // Id token
    const decodedIdToken = JwtDecode<any>(idToken);

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
