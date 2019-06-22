import React, { ReactNode } from "react";
import { Button } from "react-bootstrap";
import { Route, Link, Switch, RouteComponentProps } from "react-router-dom";

import { GlobalAuth } from "./services/Auth";

import Callback from "./components/Callback";
import Home from "./components/Home";

import "./App.css";

class App extends React.Component<any> {
  private login = (): void => {
    GlobalAuth.login();
  };

  private logout = (): void => {
    GlobalAuth.logout();
  };

  private handleAuthentication = (props: RouteComponentProps): void => {
    if (/access_token|id_token|error/.test(props.location.hash)) {
      GlobalAuth.handleAuthentication();
    }
  };

  // Documentation for Router:
  // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
  public render(): ReactNode {
    return (
      <div>
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

        <Switch>
          <Route path="/home" component={Home} />} />
          <Route
            path="/callback"
            render={(props: RouteComponentProps): ReactNode => {
              this.handleAuthentication(props);
              return <Callback />;
            }}
          />
        </Switch>
      </div>
    );
  }
}

export default App;
