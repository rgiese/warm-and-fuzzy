import React from "react";
import { Route, Router, Switch } from "react-router-dom";

import { ApolloProvider } from "react-apollo";

import AuthStateProps from "./common/AuthStateProps";

import { GlobalAuth } from "./services/Auth";
import ApolloClient from "./services/ApolloClient";
import History from "./services/History";

import AppliedRoute from "./components/AppliedRoute";

import AuthCallback from "./containers/AuthCallback";
import Home from "./containers/Home";
import Nav from "./containers/Nav";
import NotFound from "./containers/NotFound";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {
  public isAuthenticated: boolean;

  public constructor() {
    this.isAuthenticated = GlobalAuth.IsAuthenticated;
  }
}

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  private setIsAuthenticated = (isAuthenticated: boolean): void => {
    const justLoggedOut = this.state.isAuthenticated && !isAuthenticated;

    if (justLoggedOut) {
      ApolloClient.resetStore();
    }

    this.setState({ isAuthenticated: isAuthenticated });
  };

  public render(): React.ReactElement {
    const childProps: AuthStateProps = {
      isAuthenticated: this.state.isAuthenticated,
      setIsAuthenticated: this.setIsAuthenticated,
    };

    // Documentation for Router:
    // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
    return (
      <ApolloProvider client={ApolloClient}>
        <Router history={History}>
          {/* Always show Nav (alternative: reference component directly using withRouter()) */}
          <AppliedRoute path="/" component={Nav} props={childProps} />

          <Switch>
            {/* Utility routes */}
            <AppliedRoute path="/callback" component={AuthCallback} props={childProps} />
            {/* Actual pages */}
            <AppliedRoute path="/" exact component={Home} props={childProps} />
            {/* Finally, catch all unmatched routes */}
            <Route component={NotFound} />
          </Switch>
        </Router>
      </ApolloProvider>
    );
  }
}

export default App;
