import React, { useContext } from "react";
import { Route, RouteComponentProps, RouteProps, Redirect } from "react-router-dom";

import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

interface Props extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  props?: any;
}

export default ({ component: C, props: propsToInject, ...rest }: Props): React.ReactElement => {
  const authStore = useContext(RootStoreContext).rootStore.authStore;

  return (
    <Route
      {...rest}
      render={(props): any =>
        authStore.isUserAuthenticated ? <C {...props} {...propsToInject} /> : <Redirect to={`/`} />
      }
    />
  );
};
