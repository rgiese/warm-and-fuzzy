import React from "react";
import { Button } from "react-bootstrap";

import axios from "axios";

class Home extends React.Component<any> {
  login = () => {
    this.props.auth.login();
  };

  testApi = () => {
    console.log("JWT: " + this.props.auth.getAccessToken());

    const headers = { Authorization: `Bearer ${this.props.auth.getAccessToken()}` };

    axios
      .get(`https://warmandfuzzy.azurewebsites.net/api/v1/getconfig`, { headers })
      .then(response => console.log(JSON.stringify(response)))
      .catch(error => window.alert(error.message));
  };

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div className="container">
        {isAuthenticated() && (
          <>
            <h4>Hi, {this.props.auth.getUserName()}, you are logged in!</h4>
            <Button variant="primary" onClick={this.testApi}>
              Test API
            </Button>
          </>
        )}
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
