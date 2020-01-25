import { action, computed, observable } from "mobx";

import { AuthProvider } from "./AuthProvider";
import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";
import JwtDecode from "jwt-decode";
import { TemperatureUnits } from "@grumpycorp/warm-and-fuzzy-shared";
import { UserPreferences } from "../../UserPreferences";

type AuthStoreState = "initializing" | "authenticating" | "unauthenticated" | "authenticated";

export class AuthStore {
  @observable public state: AuthStoreState;

  @observable public accessToken?: string = undefined;
  @observable public tenant?: string = undefined;
  @observable public userName?: string = undefined;
  @observable public userEmail?: string = undefined;
  @observable public userPreferences?: UserPreferences = undefined;
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    this.userPreferences = ((unitsPreferences?: any): UserPreferences => {
      const userPreferences = new UserPreferences();

      if (unitsPreferences?.hasOwnProperty("temperature")) {
        if (unitsPreferences.temperature === "celsius") {
          userPreferences.temperatureUnits = TemperatureUnits.Celsius;
        } else if (unitsPreferences.temperature === "fahrenheit") {
          userPreferences.temperatureUnits = TemperatureUnits.Fahrenheit;
        } else {
          console.log(
            `Ignoring unrecognized temperature units preference ${unitsPreferences.temperature as string}`
          );
        }
      }

      return userPreferences;
    })(
      decodedIdToken[
        AuthenticationConfiguration.CustomClaimsNamespace +
          AuthenticationConfiguration.CustomClaims.UnitsPreferences
      ]
    );
  }

  @action
  public onUserLoggedOut(): void {
    this.accessToken = undefined;
    this.tenant = undefined;
    this.userName = undefined;
    this.userEmail = undefined;
    this.userPreferences = undefined;
    this.userPermissions.clear();

    this.state = "unauthenticated";
  }
}
