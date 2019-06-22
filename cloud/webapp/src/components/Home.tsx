import React, { ReactNode } from "react";
import { Button } from "react-bootstrap";

import { GlobalAuth } from "../services/Auth";

import axios from "axios";

class Home extends React.Component<any> {
  private testApi = (): void => {
    console.log("JWT: " + GlobalAuth.AccessToken);

    const headers = { Authorization: `Bearer ${GlobalAuth.AccessToken}` };

    axios
      .get(`https://warmandfuzzy.azurewebsites.net/api/v1/getconfig`, { headers })
      .then(response => console.log(JSON.stringify(response)))
      .catch(error => window.alert(error.message));
  };

  public render(): ReactNode {
    return (
      <div className="container">
        {GlobalAuth.IsAuthenticated && (
          <>
            <h4>Hi, {GlobalAuth.UserName}, you are logged in!</h4>
            <Button variant="primary" onClick={this.testApi}>
              Test API
            </Button>
          </>
        )}
        {!GlobalAuth.IsAuthenticated && (
          <h4>
            You are not logged in! Please{" "}
            <Button
              id="qsLoginBtn"
              variant="primary"
              className="btn-margin"
              onClick={GlobalAuth.login}
            >
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
