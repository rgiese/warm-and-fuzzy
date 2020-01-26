import {
  ApolloClient,
  AuthStore,
  RootStore,
  RootStoreContext,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import { Route, Router, Switch } from "react-router-dom";

import Auth from "./services/Auth";
import AuthCallback from "./containers/AuthCallback";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import Configuration from "./containers/Configuration";
import { Container } from "semantic-ui-react";
import Explore from "./containers/Explore";
import ExplorePlotDataStore from "./stores/explore-plot-data";
import ExploreStore from "./stores/explore";
import Footer from "./containers/Footer";
import Header from "./containers/Header";
import History from "./services/History";
import Home from "./containers/Home";
import { configure as MobxConfigure } from "mobx";
import NotFound from "./containers/NotFound";
import React from "react";
import ThermostatSettings from "./containers/ThermostatSettings";
import UserPreferences from "./containers/UserPreferences";
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

const App: React.FunctionComponent = (): React.ReactElement => {
  // Documentation for Router:
  // - https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/guides/basic-components.md
  return (
    <RootStoreContext.Provider value={{ rootStore }}>
      <Router history={History}>
        {/* Always show Nav (alternative: reference component directly using withRouter()) */}
        <Route component={Header} path="/" />
        <Container
          style={{ marginTop: "4em" /* for top menu */, marginBottom: "4em" /* for footer */ }}
        >
          <Switch>
            {/* Utility routes */}
            <Route component={AuthCallback} path="/callback" />
            {/* Actual pages */}
            <Route component={Home} exact path="/" />
            <Route component={ThermostatSettings} exact path="/settings" />
            <AuthenticatedRoute component={Configuration} exact path="/configuration" />
            <AuthenticatedRoute
              component={Explore}
              exact
              path="/explore"
              props={{ exploreStore, explorePlotDataStore }}
            />
            <AuthenticatedRoute component={UserPreferences} exact path="/preferences" />
            {/* Finally, catch all unmatched routes */}
            <Route component={NotFound} />
          </Switch>
        </Container>
        <Route component={Footer} path="/" />
      </Router>
    </RootStoreContext.Provider>
  );
};

export default App;
