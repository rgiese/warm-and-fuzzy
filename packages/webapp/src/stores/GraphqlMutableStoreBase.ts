import { flow } from "mobx";
import { FetchResult } from "apollo-link";
import { DocumentNode } from "graphql";
import ApolloClient from "../services/ApolloClient";

import GraphqlStoreBase, {
  IdType,
  QueryResultDataExtractor,
  QueryResultDataItemPatcher,
} from "./GraphqlStoreBase";

export interface MutationVariablesBuilder<T extends IdType, TMutationVariables> {
  (item: T): TMutationVariables;
}

export default class GraphqlMutableStoreBase<
  T extends IdType,
  TQuery,
  TMutation,
  TMutationVariables
> extends GraphqlStoreBase<T, TQuery> {
  private mutationDocument: DocumentNode;
  private mutationVariablesBuilder: MutationVariablesBuilder<T, TMutationVariables>;

  public constructor(
    mutationDocument: DocumentNode,
    mutationVariablesBuilder: MutationVariablesBuilder<T, TMutationVariables>,
    queryDocument: DocumentNode,
    queryResultDataExtractor: QueryResultDataExtractor<T, TQuery>,
    queryResultDataItemPatcher?: QueryResultDataItemPatcher<T>
  ) {
    super(queryDocument, queryResultDataExtractor, queryResultDataItemPatcher);

    this.mutationDocument = mutationDocument;
    this.mutationVariablesBuilder = mutationVariablesBuilder;
  }

  updateItem = flow(function*(
    this: GraphqlMutableStoreBase<T, TQuery, TMutation, TMutationVariables>,
    item: T
  ) {
    this.state = "updating";

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
      const yieldedMutationResult = yield ApolloClient.mutate<TMutation, TMutationVariables>({
        mutation: this.mutationDocument,
        variables: mutationVariables,
      });

      const mutationResult = (yieldedMutationResult as unknown) as FetchResult<TMutation>;

      if (mutationResult.errors) {
        throw new Error(mutationResult.errors.toString());
      }

      this.data[updatedItemIndex] = item;

      this.state = "ready";
    } catch (error) {
      this.error = error;
      this.state = "error";
    }
  });
}
