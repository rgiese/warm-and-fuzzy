import { observable, computed, action, reaction, runInAction } from "mobx";
import moment from "moment";

import { ExploreStore } from "../stores";
import SeriesInstanceData from "./SeriesInstanceData";
import SeriesInstanceDataDefinition from "./SeriesInstanceDataDefinition";
import Timezone from "../explore/Timezone";
import { viewSpanToDays } from "../explore/ViewSpan";

import gql from "graphql-tag";
import {
  PlotSeriesDocument,
  PlotSeriesQuery,
  PlotSeriesQueryVariables,
} from "../../generated/graphqlClient";
import ApolloClient from "../../services/ApolloClient";

gql`
  query PlotSeries($streamName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
    getThermostatValueStreams(streamName: $streamName, fromDate: $fromDate, toDate: $toDate) {
      deviceTime
      temperature
    }
  }
`;

export class ExplorePlotDataStore {
  private exploreStore: ExploreStore;

  constructor(exploreStore: ExploreStore) {
    this.exploreStore = exploreStore;

    reaction(
        () => this.seriesInstanceDataDefinitions.map(d => d),
        seriesInstanceDataDefinitions => {
            this.fetchSeriesInstanceData(seriesInstanceDataDefinitions);
      }
    );
  }

  // SeriesInstanceDataDefinitions
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

  // SeriesInstanceData
  readonly seriesInstanceDatas = observable.array<SeriesInstanceData>([]);

  @action
  async fetchSeriesInstanceData(seriesInstanceDataDefinitions: SeriesInstanceDataDefinition[]) {
    if (seriesInstanceDataDefinitions.length === 0) {
      this.seriesInstanceDatas.replace([]);
      return;
    }

    const seriesInstanceDatas = await Promise.all(
      seriesInstanceDataDefinitions.map(
        async (definition): Promise<SeriesInstanceData> => {
          let data;
          let errors;
          let min: number | undefined;
          let max: number | undefined;

          try {
            const startDate =
              definition.timezone === Timezone.Local
                ? moment(definition.startDate)
                : moment.utc(definition.startDate);

            let fromMoment = moment(startDate).startOf("day");

            const fromDate = fromMoment.toDate();
            const toDate = fromMoment.add(viewSpanToDays(definition.viewSpan), "day").toDate();

            const queryResult = await ApolloClient.query<PlotSeriesQuery, PlotSeriesQueryVariables>(
              {
                query: PlotSeriesDocument,
                variables: {
                  streamName: definition.streamName,
                  fromDate,
                  toDate,
                },
              }
            );

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
                const deviceTime_RelativeToStartTime = deviceTime.getTime() - fromDate.getTime();

                // Shift interval relative to a semi-arbitrary start day (today) so that Nivo uses today's timezone for display
                // (will cause issues if there's a change in timezones during a multi-day view - alas.)
                const deviceTime_RelativeToStartTime_TimezoneAdjusted =
                  deviceTime_RelativeToStartTime + startOfToday;

                // Memoize series min/max Y values
                min = min ? Math.min(min, value.temperature) : value.temperature;
                max = max ? Math.max(max, value.temperature) : value.temperature;

                return { x: deviceTime_RelativeToStartTime_TimezoneAdjusted, y: value.temperature };
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

    runInAction(() => {
      this.seriesInstanceDatas.replace(seriesInstanceDatas);
    });
  }
}
