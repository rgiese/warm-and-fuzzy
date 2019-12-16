import { computed, observable } from "mobx";

export class StoreBase {
  @observable state: "fetching" | "updating" | "ready" | "error" = "ready";
  error?: string;

  public constructor() {
    this.state = "fetching";
  }

  @computed get isReady(): boolean {
    return this.state === "ready";
  }

  @computed get isUpdating(): boolean {
    return this.state === "updating";
  }

  @computed get hasErrors(): boolean {
    return this.state === "error";
  }

  @computed get isWorking(): boolean {
    return !this.isReady && !this.hasErrors;
  }
}
