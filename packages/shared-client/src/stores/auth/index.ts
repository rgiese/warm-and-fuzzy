import { action, observable } from "mobx";

export class AuthStore {
  @observable isUserAuthenticated = false;

  @action
  public onUserLoggedIn(): void {
    this.isUserAuthenticated = true;
  }

  @action
  public onUserLoggedOut(): void {
    this.isUserAuthenticated = false;
  }
}
