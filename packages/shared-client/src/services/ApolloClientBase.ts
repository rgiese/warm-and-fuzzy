import { ApolloClient as ApolloClient_Official } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";

export namespace ApolloClient {
  export function buildApolloClient(link?: ApolloLink) {
    return new ApolloClient_Official({
      cache: new InMemoryCache(),
      link,
    });
  }

  export type ApolloClientBase = ReturnType<typeof buildApolloClient>;
}
