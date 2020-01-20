import History from "../services/History";
import React from "react";
import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

// Instantiated for the /callback route that Auth0's universal login page will redirect to after logging in
// eslint-disable-next-line react/require-optimization
class AuthCallback extends React.Component<{}> {
  public async componentDidMount(): Promise<void> {
    const authStore = this.context.rootStore.authStore;

    // Asynchronously verify that authentication succeeded
    await authStore.authProvider.completeLogin();

    // Reload the main app page
    History.replace("/");
  }

  static contextType = RootStoreContext;
  context!: React.ContextType<typeof RootStoreContext>;

  public render(): React.ReactElement {
    return <div>Applying authentication...</div>;
  }
}

export default AuthCallback;
