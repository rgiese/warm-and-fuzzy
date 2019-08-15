import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";

import config from "../config";

import { GlobalAuth } from "./Auth";

const apolloHttpLink = createHttpLink({ uri: `${config.apiGateway.URL}/graphql` });

const apolloAuthContextLink = setContext((_, { headers }): any => {
  return {
    headers: {
      ...headers,
      authorization: GlobalAuth.IsAuthenticated ? `Bearer ${GlobalAuth.AccessToken}` : "",
    },
  };
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: apolloAuthContextLink.concat(apolloHttpLink),
});

export default apolloClient;
