import { action, computed, observable } from "mobx";

type StoreState = "fetching" | "updating" | "ready" | "error";

export class StoreBase {
  readonly name: string;
  error?: string;

  @observable private state: StoreState = "ready";

  public constructor(name: string) {
    this.name = name;
  }

  @action setState(state: StoreState): void {
    //console.log(`${this.name}: ${this.state} -> ${state}`);

    this.state = state;
  }

  setError(error: string): void {
    this.error = error;
    this.setState("error");
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
