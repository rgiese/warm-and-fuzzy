import { PlotSeriesQuery, PlotSeriesQueryVariables } from "../../generated/graphqlClient";
import { action, computed, observable, reaction, runInAction } from "mobx";

import { ApolloClient } from "@grumpycorp/warm-and-fuzzy-shared-client";
import ExploreStore from "../explore";
import SeriesInstanceData from "./SeriesInstanceData";
import SeriesInstanceDataDefinition from "./SeriesInstanceDataDefinition";
import Timezone from "../explore/Timezone";
import gql from "graphql-tag";
import moment from "moment";
import { viewSpanToDays } from "../explore/ViewSpan";

const plotSeriesDocument = gql`
  query PlotSeries($streamName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
    getThermostatValueStreams(streamName: $streamName, fromDate: $fromDate, toDate: $toDate) {
      deviceTime
      temperature
    }
  }
`;

export default class ExplorePlotDataStore {
  private exploreStore: ExploreStore;
  private apolloClient: ApolloClient;

  constructor(exploreStore: ExploreStore, apolloClient: ApolloClient) {
    this.exploreStore = exploreStore;
    this.apolloClient = apolloClient;

    reaction(
      () => this.seriesInstanceDataDefinitions.map(d => d),
      seriesInstanceDataDefinitions => {
        this.fetchSeriesInstanceData(seriesInstanceDataDefinitions);
      }
    );
  }

  //
  // SeriesInstanceDataDefinitions
  //

  @computed get seriesInstanceDataDefinitions(): SeriesInstanceDataDefinition[] {
    return this.exploreStore.seriesInstanceProps.map(
      seriesInstance =>
        new SeriesInstanceDataDefinition(
          seriesInstance.seriesIdentifier.streamName,
          seriesInstance.startDate,
          this.exploreStore.viewSpan,
          this.exploreStore.timezone
        )
    );
  }

  //
  // SeriesInstanceData
  //

  readonly seriesInstanceDatas = observable.map<string, SeriesInstanceData>();

  @action
  async fetchSeriesInstanceData(
    seriesInstanceDataDefinitions: SeriesInstanceDataDefinition[]
  ): Promise<void> {
    if (seriesInstanceDataDefinitions.length === 0) {
      this.seriesInstanceDatas.clear();
      return;
    }

    // Retire data that's no longer required
    const requiredDataDefinitionStrings = seriesInstanceDataDefinitions.map(def => def.toString());
    const existingDataDefinitionStrings = Array.from(this.seriesInstanceDatas.keys());

    existingDataDefinitionStrings.forEach(existingDataDefinitionString => {
      if (!requiredDataDefinitionStrings.includes(existingDataDefinitionString)) {
        this.seriesInstanceDatas.delete(existingDataDefinitionString);
      }
    });

    // Determine what we need to fetch
    const unfetchedDataDefinitionStrings = requiredDataDefinitionStrings.filter(
      requiredDataDefinitionString =>
        !existingDataDefinitionStrings.includes(requiredDataDefinitionString)
    );

    // Fetch data
    const fetchedSeriesInstanceDatas = await Promise.all(
      unfetchedDataDefinitionStrings.map(
        async (definitionString): Promise<SeriesInstanceData> => {
          const definition = seriesInstanceDataDefinitions.find(
            def => def.toString() === definitionString
          );

          if (!definition) {
            throw new Error("Expected to find definition.");
          }

          let data;
          let errors;
          let min: number | undefined;
          let max: number | undefined;

          try {
            const startDate =
              definition.timezone === Timezone.Local
                ? moment(definition.startDate)
                : moment.utc(definition.startDate);

            const fromMoment = moment(startDate).startOf("day");

            const fromDate = fromMoment.toDate();
            const toDate = fromMoment.add(viewSpanToDays(definition.viewSpan), "day").toDate();

            const queryResult = await this.apolloClient.query<
              PlotSeriesQuery,
              PlotSeriesQueryVariables
            >({
              query: plotSeriesDocument,
              variables: {
                streamName: definition.streamName,
                fromDate,
                toDate,
              },
            });

            if (queryResult.errors) {
              errors = JSON.stringify(queryResult.errors);
            } else if (!queryResult.data || !queryResult.data.getThermostatValueStreams) {
              errors = "No data returned";
            } else {
              const startOfToday = moment()
                .startOf("day")
                .valueOf();

              data = queryResult.data.getThermostatValueStreams.map((value: any) => {
                // Parse text timestamp returned by GraphQL
                const deviceTime = new Date(value.deviceTime);

                // Determine relative time to start time (since series may have different start days)
                const deviceTimeRelativeToStartTime = deviceTime.getTime() - fromDate.getTime();

                // Shift interval relative to a semi-arbitrary start day (today) so that Nivo uses today's timezone for display
                // (will cause issues if there's a change in timezones during a multi-day view - alas.)
                const deviceTimeRelativeToStartTimeTimezoneAdjusted =
                  deviceTimeRelativeToStartTime + startOfToday;

                // Memoize series min/max Y values
                min = min ? Math.min(min, value.temperature) : value.temperature;
                max = max ? Math.max(max, value.temperature) : value.temperature;

                return { x: deviceTimeRelativeToStartTimeTimezoneAdjusted, y: value.temperature };
              });

              console.log(`Fetched ${data.length} datapoints for ${definition.toString()}`);
            }
          } catch (error) {
            errors = JSON.stringify(error);
          }

          return { definition, data, errors, min, max };
        }
      )
    );

    // Commit fetched data
    runInAction(() => {
      this.seriesInstanceDatas.merge(
        fetchedSeriesInstanceDatas.map(seriesInstanceData => [
          seriesInstanceData.definition.toString(),
          seriesInstanceData,
        ])
      );
    });
  }
}
