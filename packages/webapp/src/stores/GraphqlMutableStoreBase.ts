import { action } from "mobx";
//import { ApolloQueryResult } from "apollo-client";
import { DocumentNode } from "graphql";

//import ApolloClient from "../services/ApolloClient";

import GraphqlStoreBase, {
  IdType,
  QueryResultExtractor,
  QueryResultPatcher,
} from "./GraphqlStoreBase";

export default class GraphqlMutableStoreBase<T extends IdType, TQuery> extends GraphqlStoreBase<
  T,
  TQuery
> {
  public constructor(
    queryDocument: DocumentNode,
    resultExtractor: QueryResultExtractor<T, TQuery>,
    resultPatcher?: QueryResultPatcher<T>
  ) {
    super(queryDocument, resultExtractor, resultPatcher);
  }

  @action
  updateItem(item: T) {
    const updatedItemIndex = this.data.findIndex(existingItem => existingItem.id === item.id);

    // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
    if (item.__typename) {
      delete item.__typename;
    }

    // TODO: Persist change

    this.data[updatedItemIndex] = item;
  }
}
