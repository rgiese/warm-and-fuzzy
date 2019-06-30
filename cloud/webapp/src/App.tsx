import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Auth } from "aws-amplify";

import AuthStateProps from "./common/AuthStateProps";

import History from "./services/History";

import AppliedRoute from "./components/AppliedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

import Home from "./containers/Home";
import Nav from "./containers/Nav";
import Login from "./containers/Login";
import NotFound from "./containers/NotFound";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {
  public isAuthenticated: boolean;
  public isAuthenticating: boolean;

  public constructor() {
    this.isAuthenticated = false;
    this.isAuthenticating = true;
  }
}

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public async componentDidMount(): Promise<void> {
    try {
      await Auth.currentSession();
      this.setUserHasAuthenticated(true);
    } catch (e) {
      if (e !== "No current user") {
        alert(e);
      }
    }

    this.setState({ isAuthenticating: false });
  }

  private setUserHasAuthenticated = (authenticated: boolean): void => {
    this.setState({ isAuthenticated: authenticated });
  };

  public render(): React.ReactElement {
    const childProps: AuthStateProps = {
      isAuthenticated: this.state.isAuthenticated,
      setUserHasAuthenticated: this.setUserHasAuthenticated,
    };

    // Documentation for Router:
    // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
    return (
      <Router history={History}>
        {!this.state.isAuthenticating && (
          <>
            {
              // Always show Nav (alternative: reference component directly using withRouter())
            }
            <AppliedRoute path="/" component={Nav} props={childProps} />

            {
              // Pages
            }
            <Switch>
              <AppliedRoute path="/" exact component={Home} props={childProps} />
              <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
              {/* Finally, catch all unmatched routes */}
              <Route component={NotFound} />
            </Switch>
          </>
        )}
      </Router>
    );
  }
}

export default App;
