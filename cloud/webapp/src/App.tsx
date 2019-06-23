import React, { ReactNode } from "react";
import { Route, RouteComponentProps, Router } from "react-router-dom";

import { GlobalAuth } from "./services/Auth";
import History from "./services/History";

import Callback from "./components/Callback";
import Home from "./components/Home";
import Nav from "./components/Nav";

import "./App.css";

class App extends React.Component<{}> {
  private handleAuthentication = (props: RouteComponentProps): void => {
    if (/access_token|id_token|error/.test(props.location.hash)) {
      GlobalAuth.handleAuthentication();
    }
  };

  // Documentation for Router:
  // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
  public render(): ReactNode {
    return (
      <Router history={History}>
        {
          // Always show Nav (alternative: reference component directly using withRouter())
        }
        <Route path="/" component={Nav} />

        {
          // Utility routes
        }
        <Route
          path="/callback"
          render={(props: RouteComponentProps): ReactNode => {
            this.handleAuthentication(props);
            return <Callback />;
          }}
        />

        {
          // Pages
        }
        <Route path="/home" component={Home} />
      </Router>
    );
  }
}

export default App;
