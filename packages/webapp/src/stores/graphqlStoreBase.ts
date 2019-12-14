import { flow, observable } from "mobx";
import { ApolloQueryResult } from "apollo-client";
import { DocumentNode } from "graphql";

import ApolloClient from "../services/ApolloClient";

interface QueryResultExtractor<TResult, TQuery> {
  (queryData: TQuery): TResult[];
}

interface QueryResultPatcher<TResult> {
  (data: TResult): TResult;
}

export default class GraphqlStoreBase<T, TQuery> {
  @observable state: "fetching" | "ready" | "error" = "fetching";
  error?: string;

  readonly data = observable.array<T>([]);

  private queryDocument: DocumentNode;
  private resultExtractor: QueryResultExtractor<T, TQuery>;
  private resultPatcher?: QueryResultPatcher<T>;

  public constructor(
    queryDocument: DocumentNode,
    resultExtractor: QueryResultExtractor<T, TQuery>,
    resultPatcher?: QueryResultPatcher<T>
  ) {
    this.queryDocument = queryDocument;
    this.resultExtractor = resultExtractor;
    this.resultPatcher = resultPatcher;

    this.fetchData();
  }

  fetchData = flow(function*(this: GraphqlStoreBase<T, TQuery>) {
    this.state = "fetching";

    try {
      // TypeScripts clowning around for MobX/flow requiring yield vs. await
      const yieldedQueryResult = yield ApolloClient.query<TQuery, {}>({
        query: this.queryDocument,
      });

      const queryResult = (yieldedQueryResult as unknown) as ApolloQueryResult<TQuery>;

      if (queryResult.errors) {
        throw new Error(queryResult.errors.toString());
      }

      if (!queryResult.data) {
        throw new Error("No data returned");
      }

      const extractedData = this.resultExtractor(queryResult.data);

      if (!this.resultPatcher) {
        this.data.replace(extractedData);
      } else {
        this.data.replace(extractedData.map(this.resultPatcher));
      }

      this.state = "ready";
    } catch (error) {
      this.error = JSON.stringify(error);
      this.state = "error";
    }
  });
}
