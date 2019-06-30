import React from "react";
import { Link } from "react-router-dom";

import AuthStateProps from "../common/AuthStateProps";
import { GlobalAuth } from "../services/Auth";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

class Nav extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  private handleLogin = (): void => {
    GlobalAuth.login();
  };

  private handleLogout = (): void => {
    GlobalAuth.logout();
  };

  public render(): React.ReactElement {
    return (
      <>
        <Link to="/">Home</Link>
        {!this.props.isAuthenticated ? (
          <span onClick={this.handleLogin}>[ Log in ]</span>
        ) : (
          <span onClick={this.handleLogout}>[ Log out ]</span>
        )}
      </>
    );
  }
}

export default Nav;
