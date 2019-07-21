import React from "react";
import { Route, RouteComponentProps, RouteProps, Redirect } from "react-router-dom";

function extractFromQueryString(name: string, url = window.location.href): string | null {
  const cleanedName = name.replace(/[[]]/g, "\\$&");

  const regex = new RegExp("[?&]" + cleanedName + "(=([^&#]*)|&|#|$)", "i");
  const results = regex.exec(url);

  if (!results) {
    return null;
  }

  if (!results[2]) {
    return "";
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

interface Props extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  props: any;
}

export default ({ component: C, props: propsToInject, ...rest }: Props): React.ReactElement => {
  const redirect = extractFromQueryString("redirect");

  return (
    <Route
      {...rest}
      render={(props): any =>
        !propsToInject.isAuthenticated ? (
          <C {...props} {...propsToInject} />
        ) : (
          <Redirect to={redirect === "" || redirect === null ? "/" : redirect} />
        )
      }
    />
  );
};
