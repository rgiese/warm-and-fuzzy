import { computed, observable } from "mobx";

export default class StoreBase {
  @observable state: "fetching" | "updating" | "ready" | "error" = "fetching";
  error?: string;

  public constructor() {
    this.state = "fetching";
  }

  @computed get isReady(): boolean {
    return this.state === "ready";
  }

  @computed get hasErrors(): boolean {
    return this.state === "error";
  }

  @computed get isWorking(): boolean {
    return !this.isReady && !this.hasErrors;
  }
}
