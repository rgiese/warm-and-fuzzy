import { flow, observable } from "mobx";
import { computedFn } from "mobx-utils";
import { ApolloQueryResult } from "apollo-client";
import { DocumentNode } from "graphql";

import { ApolloClient } from "../services/ApolloClientBase";

import { StoreBase } from "./StoreBase";

export interface GraphqlStoreItem {
  id: string;
  __typename?: string;
}

export interface QueryResultDataExtractor<TResult, TQuery> {
  (queryData: TQuery): TResult[];
}

export interface QueryResultDataItemPatcher<TResult> {
  (data: TResult): TResult;
}

export class GraphqlStoreBase<T extends GraphqlStoreItem, TQuery> extends StoreBase {
  readonly data = observable.array<T>([]);

  protected apolloClient: ApolloClient.ApolloClientBase;

  private queryDocument: DocumentNode;
  private queryResultDataExtractor: QueryResultDataExtractor<T, TQuery>;
  private queryResultDataItemPatcher?: QueryResultDataItemPatcher<T>;

  public constructor(
    apolloClient: ApolloClient.ApolloClientBase,
    queryDocument: DocumentNode,
    queryResultDataExtractor: QueryResultDataExtractor<T, TQuery>,
    queryResultDataItemPatcher?: QueryResultDataItemPatcher<T>
  ) {
    super();

    this.apolloClient = apolloClient;
    this.queryDocument = queryDocument;
    this.queryResultDataExtractor = queryResultDataExtractor;
    this.queryResultDataItemPatcher = queryResultDataItemPatcher;

    this.fetchData();
  }

  fetchData = flow(function*(this: GraphqlStoreBase<T, TQuery>) {
    this.state = "fetching";

    try {
      // TypeScript clowning around for MobX/flow requiring yield vs. await
      const yieldedQueryResult = yield this.apolloClient.query<TQuery>({
        query: this.queryDocument,
      });

      const queryResult = (yieldedQueryResult as unknown) as ApolloQueryResult<TQuery>;

      if (queryResult.errors) {
        throw new Error(JSON.stringify(queryResult.errors)); // stringify errors
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
      this.error = JSON.stringify(error); // stringify exception
      this.state = "error";
    }
  });

  findById = computedFn(function(this: GraphqlStoreBase<T, TQuery>, id: string): T | undefined {
    // For now we're going to assume that our datasets are small enough
    // that a linear search is good enough.
    return this.data.find(item => item.id === id);
  });
}
