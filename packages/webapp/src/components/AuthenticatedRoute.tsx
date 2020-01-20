import React from "react";
import { Route, RouteComponentProps, RouteProps, Redirect } from "react-router-dom";

import { useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

interface Props extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  props?: any;
}

export default ({ component: C, props: propsToInject, ...rest }: Props): React.ReactElement => {
  const authStore = useRootStore().authStore;

  return (
    <Route
      {...rest}
      render={(props): any =>
        authStore.isUserAuthenticated ? <C {...props} {...propsToInject} /> : <Redirect to={`/`} />
      }
    />
  );
};
