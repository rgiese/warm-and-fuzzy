import React from "react";
import { Route, RouteComponentProps, RouteProps } from "react-router-dom";

interface Props extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  props: any;
}

export default ({ component: C, props: propsToInject, ...rest }: Props): React.ReactElement => (
  <Route {...rest} render={(props): any => <C {...props} {...propsToInject} />} />
);
