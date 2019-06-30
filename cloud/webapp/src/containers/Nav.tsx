import React from "react";
import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";

import AuthStateProps from "../common/AuthStateProps";

import History from "../services/History";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

class Nav extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  private handleLogout = async (): Promise<void> => {
    await Auth.signOut();

    this.props.setUserHasAuthenticated(false);

    History.push("/login");
  };

  public render(): React.ReactElement {
    return (
      <>
        <Link to="/">Home</Link>
        {this.props.isAuthenticated ? (
          <span onClick={this.handleLogout}>[ Logout ]</span>
        ) : (
          <Link to="/login">[ Login ]</Link>
        )}
      </>
    );
  }
}

export default Nav;
