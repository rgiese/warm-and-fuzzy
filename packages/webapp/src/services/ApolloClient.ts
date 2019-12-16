import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";

import { ApolloClient } from "@grumpycorp/warm-and-fuzzy-shared-client";

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

const apolloClient = ApolloClient.buildApolloClient(apolloAuthContextLink.concat(apolloHttpLink));

export default apolloClient;
