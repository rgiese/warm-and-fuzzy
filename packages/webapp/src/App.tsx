import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Container } from "semantic-ui-react";

import { ApolloProvider } from "react-apollo";
import { configure as MobxConfigure } from "mobx";

import AuthStateProps from "./common/AuthStateProps";

import { GlobalAuth } from "./services/Auth";
import ApolloClient from "./services/ApolloClient";
import History from "./services/History";

import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";

import AuthCallback from "./containers/AuthCallback";
import Configuration from "./containers/Configuration";
import Explore from "./containers/Explore";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";

import Header from "./containers/Header";
import Footer from "./containers/Footer";

import { RootStore, ExploreStore, ExplorePlotDataStore } from "./stores/stores";

// App-wide MobX configuration
MobxConfigure({ enforceActions: "observed" });

const rootStore = new RootStore();
const exploreStore = new ExploreStore(rootStore); // for the top-level Explore page
const explorePlotDataStore = new ExplorePlotDataStore(exploreStore);

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
    const stateChanged = this.state.isAuthenticated !== isAuthenticated;

    if (stateChanged) {
      if (isAuthenticated) {
        rootStore.authStore.onUserLoggedIn();
      } else {
        rootStore.authStore.onUserLoggedOut();
        ApolloClient.resetStore();
      }
    }

    this.setState({ isAuthenticated: isAuthenticated });
  };

  public render(): React.ReactElement {
    const childAuthStateProps: AuthStateProps = {
      isAuthenticated: this.state.isAuthenticated,
      setIsAuthenticated: this.setIsAuthenticated,
    };

    const childProps = {
      ...childAuthStateProps,
      rootStore,
    };

    // Documentation for Router:
    // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
    return (
      <ApolloProvider client={ApolloClient}>
        <Router history={History}>
          {/* Always show Nav (alternative: reference component directly using withRouter()) */}
          <AppliedRoute path="/" component={Header} props={childProps} />
          <Container
            style={{ marginTop: "4em" /* for top menu */, marginBottom: "4em" /* for footer */ }}
          >
            <Switch>
              {/* Utility routes */}
              <AppliedRoute path="/callback" component={AuthCallback} props={childProps} />
              {/* Actual pages */}
              <AppliedRoute path="/" exact component={Home} props={childProps} />
              <AuthenticatedRoute
                path="/configuration"
                exact
                component={Configuration}
                props={childProps}
              />
              <AuthenticatedRoute
                path="/explore"
                exact
                component={Explore}
                props={{ ...childProps, exploreStore, explorePlotDataStore }}
              />
              {/* Finally, catch all unmatched routes */}
              <Route component={NotFound} />
            </Switch>
          </Container>
          <AppliedRoute path="/" component={Footer} props={childProps} />
        </Router>
      </ApolloProvider>
    );
  }
}

export default App;
