import { action, computed, observable } from "mobx";

export type StoreState = "fetching" | "updating" | "ready" | "error";

export class StoreBase {
  @observable private state: StoreState = "ready";

  public readonly name: string;

  public lastUpdated: Date = new Date();

  public error?: string;

  public constructor(name: string) {
    this.name = name;
  }

  @action public setState(state: StoreState): void {
    //console.log(`${this.name}: ${this.state} -> ${state}`);
    this.state = state;

    if (state === "ready") {
      this.lastUpdated = new Date();
    }
  }

  public setError(error: string): void {
    this.error = error;
    this.setState("error");
  }

  @computed public get isReady(): boolean {
    return this.state === "ready";
  }

  @computed public get isUpdating(): boolean {
    return this.state === "updating";
  }

  @computed public get hasErrors(): boolean {
    return this.state === "error";
  }

  @computed public get isWorking(): boolean {
    return !this.isReady && !this.hasErrors;
  }
}
