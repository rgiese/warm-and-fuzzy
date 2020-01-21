import {
  GraphqlStoreBase,
  GraphqlStoreItem,
  QueryResultDataExtractor,
  QueryResultDataItemPatcher,
} from "./GraphqlStoreBase";

import { ApolloClient } from "../services/ApolloClient";
import { AuthStore } from "./auth";
import { DocumentNode } from "graphql";
import { FetchResult } from "apollo-link";
import { flow } from "mobx";

/* Member ordering gets too weird with annotations, generators, etc. */
/* eslint-disable @typescript-eslint/member-ordering */

export type MutationVariablesBuilder<T extends GraphqlStoreItem, TMutationVariables> = (
  item: T
) => TMutationVariables;

export class GraphqlMutableStoreBase<
  T extends GraphqlStoreItem,
  TQuery,
  TMutation,
  TMutationVariables
> extends GraphqlStoreBase<T, TQuery> {
  private readonly mutationDocument: DocumentNode;
  private readonly mutationVariablesBuilder: MutationVariablesBuilder<T, TMutationVariables>;

  public constructor(
    name: string,
    authStore: AuthStore,
    apolloClient: ApolloClient,
    mutationDocument: DocumentNode,
    mutationVariablesBuilder: MutationVariablesBuilder<T, TMutationVariables>,
    queryDocument: DocumentNode,
    queryResultDataExtractor: QueryResultDataExtractor<T, TQuery>,
    queryResultDataItemPatcher?: QueryResultDataItemPatcher<T>
  ) {
    super(
      name,
      authStore,
      apolloClient,
      queryDocument,
      queryResultDataExtractor,
      queryResultDataItemPatcher
    );

    this.mutationDocument = mutationDocument;
    this.mutationVariablesBuilder = mutationVariablesBuilder;
  }

  public updateItem = flow(function*(
    this: GraphqlMutableStoreBase<T, TQuery, TMutation, TMutationVariables>,
    item: T
  ) {
    this.setState("updating");

    try {
      const updatedItemIndex = this.data.findIndex(existingItem => existingItem.id === item.id);

      if (updatedItemIndex === -1) {
        throw new Error("Item not found");
      }

      // Remove GraphQL-injected fields that won't be accepted in a GraphQL mutation
      if (item.__typename) {
        delete item.__typename;
      }

      const mutationVariables = this.mutationVariablesBuilder(item);

      // TypeScript clowning around for MobX/flow requiring yield vs. await
      const yieldedMutationResult = yield this.apolloClient.mutate<TMutation, TMutationVariables>({
        mutation: this.mutationDocument,
        variables: mutationVariables,
      });

      const mutationResult = (yieldedMutationResult as unknown) as FetchResult<TMutation>;

      if (mutationResult.errors) {
        throw new Error(JSON.stringify(mutationResult.errors)); // stringify errors
      }

      this.data[updatedItemIndex] = item;

      this.setState("ready");
    } catch (error) {
      this.setError(JSON.stringify(error)); // stringify exception
    }
  });
}
