import { observable } from "mobx";

export default class StoreBase {
  @observable state: "fetching" | "ready" | "error" = "fetching";
  error?: string;

  public constructor() {
    this.state = "fetching";
  }
}
