import { ApolloClient as ApolloClientCore } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";

export namespace ApolloClient {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  export function buildApolloClient(link?: ApolloLink) {
    return new ApolloClientCore({
      cache: new InMemoryCache(),
      link,
    });
  }

  export type ApolloClientBase = ReturnType<typeof buildApolloClient>;
}
