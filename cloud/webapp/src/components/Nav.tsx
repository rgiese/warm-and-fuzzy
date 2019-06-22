import React, { ReactNode } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { GlobalAuth } from "../services/Auth";

class Nav extends React.Component {
  private login = (): void => {
    GlobalAuth.login();
  };

  private logout = (): void => {
    GlobalAuth.logout();
  };

  public render(): ReactNode {
    return (
      <>
        <Link to="/home">
          <Button variant="primary" className="btn-margin">
            Home
          </Button>
        </Link>
        {!GlobalAuth.IsAuthenticated && (
          <Button id="qsLoginBtn" variant="primary" className="btn-margin" onClick={this.login}>
            Log In
          </Button>
        )}
        {GlobalAuth.IsAuthenticated && (
          <Button id="qsLogoutBtn" variant="primary" className="btn-margin" onClick={this.logout}>
            Log Out
          </Button>
        )}
      </>
    );
  }
}

export default Nav;
