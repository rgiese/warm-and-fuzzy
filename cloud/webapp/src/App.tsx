import React from "react";
import { Button } from "react-bootstrap";
import { Route, Link, Switch } from "react-router-dom";

import Auth from "./services/Auth";

import Callback from "./components/Callback";
import Home from "./components/Home";

import "./App.css";

class App extends React.Component<any> {
  auth = new Auth();

  handleAuthentication = (props: any) => {
    if (/access_token|id_token|error/.test(props.location.hash)) {
      this.auth.handleAuthentication();
    }
  };

  componentDidMount() {}

  login = () => {
    this.auth.login();
  };

  // renewToken = () => {
  //   auth.renewToken();
  // };

  logout = () => {
    this.auth.logout();
  };

  // Documentation for Router:
  // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
  render() {
    return (
      <div>
        <Link to="/home">
          <Button variant="primary" className="btn-margin">
            Home
          </Button>
        </Link>
        {!this.auth.isAuthenticated() && (
          <Button id="qsLoginBtn" variant="primary" className="btn-margin" onClick={this.login}>
            Log In
          </Button>
        )}
        {this.auth.isAuthenticated() && (
          <Button id="qsLogoutBtn" variant="primary" className="btn-margin" onClick={this.logout}>
            Log Out
          </Button>
        )}

        <Switch>
          <Route path="/home" render={props => <Home auth={this.auth} {...props} />} />

          <Route
            path="/callback"
            render={props => {
              this.handleAuthentication(props);
              return <Callback {...props} />;
            }}
          />
        </Switch>
      </div>
    );
  }
}

export default App;
