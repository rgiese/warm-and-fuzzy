import React from "react";
import { Dimmer, Loader, Message } from "semantic-ui-react";
import { ResponsiveScatterPlotCanvas, Scale, Serie, Datum } from "@nivo/scatterplot";
import { LinearScale, TimeScale } from "@nivo/scales";
import { AxisProps } from "@nivo/axes";
import moment from "moment";

import SeriesColorPalette from "./SeriesColorPalette";
import PlotTooltip from "./PlotTooltip";
import Timezone from "../../stores/explore/Timezone";
import ViewSpan, { viewSpanToDays } from "../../stores/explore/ViewSpan";

import ExploreStore from "../../stores/explore";

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

class SeriesInstanceDataDefinition {
  public constructor(
    streamName: string,
    startDate: string,
    viewSpan: ViewSpan,
    timezone: Timezone
  ) {
    this.streamName = streamName;
    this.startDate = startDate;
    this.viewSpan = viewSpan;
    this.timezone = timezone;
  }

  streamName: string;
  startDate: string;
  viewSpan: ViewSpan;
  timezone: Timezone;

  public toString(): string {
    return `${this.streamName}@${this.startDate}.${this.timezone}.${this.viewSpan}`;
  }

  public equals(rhs: SeriesInstanceDataDefinition): boolean {
    return (
      this.streamName === rhs.streamName &&
      this.startDate === rhs.startDate &&
      this.viewSpan === rhs.viewSpan &&
      this.timezone === rhs.timezone
    );
  }
}

interface SeriesInstanceData {
  definition: SeriesInstanceDataDefinition;
  data?: Datum[];
  errors?: string;
  min?: number;
  max?: number;
}

interface Props {
  store: ExploreStore;
}

class State {
  public constructor() {
    this.data = [];
  }

  data: SeriesInstanceData[];
}

class Plot extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    //
    // In `State`, relative to `seriesInstanceDataHandles`, elements in `data[]` may be:
    // - Extraneous -> remove them
    // - Present -> keep them, since...
    //   - without data available -> it's likely still being fetched, let that complete asynchronously -> keep them
    //   - with data available -> keep them
    // - Missing (we haven't fetched them before) -> add them
    //

    // Build definitions for the data we'd like to have
    const seriesInstanceDataDefinitions = props.store.seriesInstanceProps.map(
      series =>
        new SeriesInstanceDataDefinition(
          series.seriesIdentifier.streamName,
          series.startDate,
          props.store.viewSpan,
          props.store.timezone
        )
    );

    // Transform those into strings for lookup purposes
    const seriesInstanceDataDefinitionsLookup = seriesInstanceDataDefinitions.map(def =>
      def.toString()
    );

    // Keep only the data we still want
    const remainingData = state.data.filter(data =>
      seriesInstanceDataDefinitionsLookup.includes(data.definition.toString())
    );

    // Transform definitions of remaining data into strings for lookup purposes
    const remainingDataDefinitionsLookup = remainingData.map(data => data.definition.toString());

    // Add additional data to be fetched
    const dataToFetch = seriesInstanceDataDefinitions
      .filter(def => !remainingDataDefinitionsLookup.includes(def.toString()))
      .map(
        (def): SeriesInstanceData => {
          return { definition: def };
        }
      );

    const data = remainingData.concat(dataToFetch);

    const haveRemovedData = remainingData.length !== state.data.length;
    const haveAddedData = dataToFetch.length > 0;

    return haveRemovedData || haveAddedData ? { data } : null;
  }

  async componentDidUpdate(): Promise<void> {
    let haveUpdated = false;

    const data = await Promise.all(
      this.state.data.map(
        async (seriesInstanceData): Promise<SeriesInstanceData> => {
          if (seriesInstanceData.data || seriesInstanceData.errors) {
            // No updates needed
            return seriesInstanceData;
          }

          let data;
          let errors;
          let min: number | undefined;
          let max: number | undefined;

          try {
            const startDate =
              this.props.store.timezone === Timezone.Local
                ? moment(seriesInstanceData.definition.startDate)
                : moment.utc(seriesInstanceData.definition.startDate);

            let fromMoment = moment(startDate).startOf("day");

            const fromDate = fromMoment.toDate();
            const toDate = fromMoment
              .add(viewSpanToDays(this.props.store.viewSpan), "day")
              .toDate();

            console.log(
              `Fetching series instance ${seriesInstanceData.definition.toString()}: ${fromDate.toISOString()} - ${toDate.toISOString()}`
            );

            const queryResult = await ApolloClient.query<PlotSeriesQuery, PlotSeriesQueryVariables>(
              {
                query: PlotSeriesDocument,
                variables: {
                  streamName: seriesInstanceData.definition.streamName,
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

              data = queryResult.data.getThermostatValueStreams.map(value => {
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

              console.log(`Fetched ${data.length} datapoints`);
            }
          } catch (error) {
            errors = JSON.stringify(error);
          }

          haveUpdated = true;
          return { ...seriesInstanceData, data, errors, min, max };
        }
      )
    );

    if (haveUpdated) {
      this.setState({ data });
    }
  }

  public render() {
    // Pick reasonable Y-axis defaults considering interior temperature ranges
    let plotMin = 16;
    let plotMax = 36;

    const plotData: Serie[] = this.props.store.seriesInstanceProps.map(
      (seriesInstanceProps): Serie => {
        const dataDefinition = new SeriesInstanceDataDefinition(
          seriesInstanceProps.seriesIdentifier.streamName,
          seriesInstanceProps.startDate,
          this.props.store.viewSpan,
          this.props.store.timezone
        );
        const dataSeriesInstance = this.state.data.find(
          data => data.data && !data.errors && data.definition.equals(dataDefinition)
        );

        const id =
          seriesInstanceProps.seriesIdentifier.name + ` (${seriesInstanceProps.startDate})`;

        plotMin =
          dataSeriesInstance && dataSeriesInstance.min
            ? Math.min(plotMin, dataSeriesInstance.min)
            : plotMin;
        plotMax =
          dataSeriesInstance && dataSeriesInstance.max
            ? Math.max(plotMax, dataSeriesInstance.max)
            : plotMax;

        return {
          id,
          data: dataSeriesInstance && dataSeriesInstance.data ? dataSeriesInstance.data : [],
        };
      }
    );

    const errors = this.state.data
      .map(seriesInstanceData => seriesInstanceData.errors)
      .filter(error => error !== undefined);

    const isLoading =
      this.state.data
        .map(seriesInstanceData => !seriesInstanceData.data && !seriesInstanceData.errors)
        .find(isLoading => isLoading) || false;

    // Time format strings via https://github.com/d3/d3-time-format
    const timeFormat = "%H:%M";

    // TimeScale format defines input data
    // - "native" = using native (JavaScript) Date objects
    // - "%Q" = msec since Unix epoch
    const xScale: TimeScale = {
      type: "time",
      format: "%Q",
    };

    const xAxis: AxisProps = {
      format: timeFormat,
      tickValues: `every ${this.props.store.viewSpan === ViewSpan.Day ? 2 : 12} hours`,
    };

    const yScale: LinearScale = {
      type: "linear",
      min: plotMin,
      max: plotMax,
    };

    const colors: string[] = this.props.store.seriesInstanceProps.map(
      series => SeriesColorPalette[series.colorIndex % SeriesColorPalette.length].hexColor
    );

    return (
      <Dimmer.Dimmable blurring style={{ width: "100%", height: "100%" }}>
        <Dimmer active={isLoading} inverted>
          <Loader content="Loading" />
        </Dimmer>
        {errors && errors.length > 0 && (
          <Message negative header="Errors fetching data" list={errors} />
        )}
        <ResponsiveScatterPlotCanvas
          data={plotData}
          colors={colors}
          nodeSize={6}
          // margin is required to show axis labels and legend
          margin={{ top: 10, right: 240, bottom: 70, left: 90 }}
          // https://github.com/plouc/nivo/issues/674 for scale casting
          xScale={(xScale as any) as Scale}
          yScale={(yScale as any) as Scale}
          axisBottom={{
            ...xAxis,
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Time",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "size",
            legendPosition: "middle",
            legendOffset: -60,
          }}
          // https://github.com/d3/d3-format
          xFormat={`time:${timeFormat}`}
          yFormat=".1f"
          tooltip={PlotTooltip}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 130,
              translateY: 0,
              itemWidth: 100,
              itemHeight: 12,
              itemsSpacing: 5,
              itemDirection: "left-to-right",
              symbolSize: 12,
              symbolShape: "circle",
            },
          ]}
        />
      </Dimmer.Dimmable>
    );
  }
}

export default Plot;
