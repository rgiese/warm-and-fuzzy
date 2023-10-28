import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";

import { ApolloClient as ApolloClientBase } from "apollo-client";
import { AuthStore } from "../stores/auth";
import { createHttpLink } from "apollo-link-http";
import { reaction } from "mobx";
import { setContext } from "apollo-link-context";

export class ApolloClient extends ApolloClientBase<NormalizedCacheObject> {
  public constructor(authStore: AuthStore, apiGatewayUrl: string) {
    const apolloHttpLink = createHttpLink({ uri: `${apiGatewayUrl}/graphql` });

    const apolloAuthContextLink = setContext((_, { headers }): any => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: {
          ...headers,
          authorization:
            authStore.isUserAuthenticated && authStore.accessToken
              ? `Bearer ${authStore.accessToken}`
              : "",
        },
      };
    });

    super({ cache: new InMemoryCache(), link: apolloAuthContextLink.concat(apolloHttpLink) });

    reaction(
      () => authStore.isUserAuthenticated,
      isUserAuthenticated => {
        if (!isUserAuthenticated) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.clearStore();
        }
      }
    );
  }
}
