import React from "react";
import { Button } from "react-bootstrap";
import { Route, Link } from "react-router-dom";

import Auth from "./services/Auth";

import Callback from "./components/Callback";
import Home from "./components/Home";

import "./App.css";

const auth = new Auth();

const handleAuthentication = (props: any) => {
  if (/access_token|id_token|error/.test(props.location.hash)) {
    auth.handleAuthentication();
  }
};

class App extends React.Component<any> {
  componentDidMount() {}

  login = () => {
    auth.login();
  };

  // renewToken = () => {
  //   auth.renewToken();
  // };

  logout = () => {
    auth.logout();
  };

  render() {
    const { isAuthenticated } = auth;

    return (
      <div>
        <Link to="/home">
          <Button variant="primary" className="btn-margin">
            Home
          </Button>
        </Link>
        {!isAuthenticated() && (
          <Button id="qsLoginBtn" variant="primary" className="btn-margin" onClick={this.login}>
            Log In
          </Button>
        )}
        {isAuthenticated() && (
          <Button id="qsLogoutBtn" variant="primary" className="btn-margin" onClick={this.logout}>
            Log Out
          </Button>
        )}

        <Route path="/" render={props => <Home auth={auth} {...props} />} />

        <Route
          path="/callback"
          render={props => {
            handleAuthentication(props);
            return <Callback {...props} />;
          }}
        />
      </div>
    );
  }
}

export default App;
