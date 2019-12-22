import React from "react";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import History from "../services/History";

// Instantiated for the /callback route that Auth0's universal login page will redirect to after logging in
class AuthCallback extends React.Component<{}> {
  static contextType = RootStoreContext;
  context!: React.ContextType<typeof RootStoreContext>;

  public async componentDidMount(): Promise<void> {
    const authStore = this.context.rootStore.authStore;

    // Asynchronously verify that authentication succeeded
    await authStore.authProvider.completeLogin();

    // Reload the main app page
    History.replace("/");
  }

  public render(): React.ReactElement {
    return <div>Applying authentication...</div>;
  }
}

export default AuthCallback;
