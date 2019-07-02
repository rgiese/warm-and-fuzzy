import React from "react";

import AuthStateProps from "../common/AuthStateProps";
import { GlobalAuth } from "../services/Auth";
import History from "../services/History";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

// Instantiated for the /callback route that Auth0's universal login page will redirect to after logging in
class AuthCallback extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public async componentDidMount(): Promise<void> {
    // Asynchronously verify that authentication succeeded
    const isAuthenticated = await GlobalAuth.handleAuthentication();

    // Notify app so state is applied appropriately
    this.props.setIsAuthenticated(isAuthenticated);

    // Reload the main app page
    History.replace("/");
  }

  public render(): React.ReactElement {
    return <div>Applying authentication...</div>;
  }
}

export default AuthCallback;
