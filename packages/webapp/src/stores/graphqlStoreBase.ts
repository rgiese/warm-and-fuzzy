import { flow, observable } from "mobx";
import { ApolloQueryResult } from "apollo-client";
import { DocumentNode } from "graphql";

import ApolloClient from "../services/ApolloClient";

import StoreBase from "./StoreBase";

export interface IdType {
  id: string;
  __typename?: string;
}

export interface QueryResultDataExtractor<TResult, TQuery> {
  (queryData: TQuery): TResult[];
}

export interface QueryResultDataItemPatcher<TResult> {
  (data: TResult): TResult;
}

export default class GraphqlStoreBase<T extends IdType, TQuery> extends StoreBase {
  readonly data = observable.array<T>([]);

  private queryDocument: DocumentNode;
  private queryResultDataExtractor: QueryResultDataExtractor<T, TQuery>;
  private queryResultDataItemPatcher?: QueryResultDataItemPatcher<T>;

  public constructor(
    queryDocument: DocumentNode,
    queryResultDataExtractor: QueryResultDataExtractor<T, TQuery>,
    queryResultDataItemPatcher?: QueryResultDataItemPatcher<T>
  ) {
    super();

    this.queryDocument = queryDocument;
    this.queryResultDataExtractor = queryResultDataExtractor;
    this.queryResultDataItemPatcher = queryResultDataItemPatcher;

    this.fetchData();
  }

  fetchData = flow(function*(this: GraphqlStoreBase<T, TQuery>) {
    this.state = "fetching";

    try {
      // TypeScript clowning around for MobX/flow requiring yield vs. await
      const yieldedQueryResult = yield ApolloClient.query<TQuery>({
        query: this.queryDocument,
      });

      const queryResult = (yieldedQueryResult as unknown) as ApolloQueryResult<TQuery>;

      if (queryResult.errors) {
        throw new Error(queryResult.errors.toString());
      }

      if (!queryResult.data) {
        throw new Error("No data returned");
      }

      const data = this.queryResultDataExtractor(queryResult.data);

      if (!this.queryResultDataItemPatcher) {
        this.data.replace(data);
      } else {
        this.data.replace(data.map(this.queryResultDataItemPatcher));
      }

      this.state = "ready";
    } catch (error) {
      this.error = error;
      this.state = "error";
    }
  });
}
