import React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { Container } from "semantic-ui-react";

import { configure as MobxConfigure } from "mobx";

import {
  ApolloClient,
  AuthStore,
  RootStore,
  RootStoreContext,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import Auth from "./services/Auth";
import History from "./services/History";

import AuthenticatedRoute from "./components/AuthenticatedRoute";

import AuthCallback from "./containers/AuthCallback";
import Configuration from "./containers/Configuration";
import Explore from "./containers/Explore";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";

import Header from "./containers/Header";
import Footer from "./containers/Footer";

import ExploreStore from "./stores/explore";
import ExplorePlotDataStore from "./stores/explore-plot-data";

import config from "./config";

// App-wide MobX configuration
MobxConfigure({ enforceActions: "observed" });

const authProvider = new Auth();
const authStore = new AuthStore(authProvider);

authProvider.initializeStore(authStore);

const apolloClient = new ApolloClient(authStore, config.apiGateway.URL);

const rootStore = new RootStore(authStore, apolloClient);
const exploreStore = new ExploreStore(rootStore); // for the top-level Explore page
const explorePlotDataStore = new ExplorePlotDataStore(exploreStore, apolloClient);

const App: React.FunctionComponent<{}> = (): React.ReactElement => {
  // Documentation for Router:
  // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
  return (
    <RootStoreContext.Provider value={{ rootStore }}>
      <Router history={History}>
        {/* Always show Nav (alternative: reference component directly using withRouter()) */}
        <Route path="/" component={Header} />
        <Container
          style={{ marginTop: "4em" /* for top menu */, marginBottom: "4em" /* for footer */ }}
        >
          <Switch>
            {/* Utility routes */}
            <Route path="/callback" component={AuthCallback} />
            {/* Actual pages */}
            <Route path="/" exact component={Home} />
            <AuthenticatedRoute path="/configuration" exact component={Configuration} />
            <AuthenticatedRoute
              path="/explore"
              exact
              component={Explore}
              props={{ exploreStore, explorePlotDataStore }}
            />
            {/* Finally, catch all unmatched routes */}
            <Route component={NotFound} />
          </Switch>
        </Container>
        <Route path="/" component={Footer} />
      </Router>
    </RootStoreContext.Provider>
  );
};

export default App;
