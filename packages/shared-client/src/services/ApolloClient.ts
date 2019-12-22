import { ApolloClient as ApolloClientBase } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { reaction } from "mobx";

import { AuthStore } from "../stores/auth";

export class ApolloClient extends ApolloClientBase<NormalizedCacheObject> {
  public constructor(authStore: AuthStore, apiGatewayUrl: string) {
    const apolloHttpLink = createHttpLink({ uri: `${apiGatewayUrl}/graphql` });

    const apolloAuthContextLink = setContext((_, { headers }): any => {
      return {
        headers: {
          ...headers,
          authorization: authStore.isUserAuthenticated ? `Bearer ${authStore.accessToken}` : "",
        },
      };
    });

    super({ cache: new InMemoryCache(), link: apolloAuthContextLink.concat(apolloHttpLink) });

    reaction(
      () => authStore.isUserAuthenticated,
      isUserAuthenticated => {
        if (!isUserAuthenticated) {
          this.clearStore();
        }
      }
    );
  }
}
