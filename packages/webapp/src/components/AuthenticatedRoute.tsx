import { Redirect, Route, RouteComponentProps, RouteProps } from "react-router-dom";

import React from "react";
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
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      render={(props): any =>
        authStore.isUserAuthenticated ? <C {...props} {...propsToInject} /> : <Redirect to="/" />
      }
    />
  );
};
