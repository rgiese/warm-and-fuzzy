import React from "react";
import { Button } from "react-bootstrap";

class Home extends React.Component<any> {
  login() {
    this.props.auth.login();
  }

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div className="container">
        {isAuthenticated() && <h4>You are logged in!</h4>}
        {!isAuthenticated() && (
          <h4>
            You are not logged in! Please{" "}
            <Button id="qsLoginBtn" variant="primary" className="btn-margin" onClick={this.login}>
              Log In
            </Button>{" "}
            to continue.
          </h4>
        )}
      </div>
    );
  }
}

export default Home;
