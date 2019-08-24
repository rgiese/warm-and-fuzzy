import React from "react";
//import { Message } from "semantic-ui-react";
import { ResponsiveScatterPlotCanvas, Scale, Serie, Datum } from "@nivo/scatterplot";
import moment from "moment";

import SeriesInstanceProps from "./SeriesInstanceProps";

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

export enum ViewSpan {
  Day = "day",
  Week = "week",
}

export enum Timezone {
  Local = "local",
  UTC = "UTC",
}

class SeriesInstanceDataDefinition {
  public constructor(streamName: string, startDate: Date, viewSpan: ViewSpan, timezone: Timezone) {
    this.streamName = streamName;
    this.startDate = startDate;
    this.viewSpan = viewSpan;
    this.timezone = timezone;
  }

  streamName: string;
  startDate: Date;
  viewSpan: ViewSpan;
  timezone: Timezone;

  public toString(): string {
    return `${this.viewSpan}.${this.timezone}.${this.streamName}@${this.startDate.toDateString()}`;
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
}

interface Props {
  seriesInstanceProps: SeriesInstanceProps[];
  viewSpan: ViewSpan;
  timezone: Timezone;
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
    const seriesInstanceDataDefinitions = props.seriesInstanceProps.map(
      series =>
        new SeriesInstanceDataDefinition(
          series.seriesIdentifier.streamName,
          series.startDate,
          props.viewSpan,
          props.timezone
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

          try {
            // TODO: incorporate viewRange, timezone
            const fromDate = moment(seriesInstanceData.definition.startDate)
              .startOf("day")
              .toDate();
            const toDate = moment(seriesInstanceData.definition.startDate)
              .endOf("day")
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
              data = queryResult.data.getThermostatValueStreams.map(value => {
                return { x: value.deviceTime, y: value.temperature };
              });

              console.log(`Fetched ${data.length} datapoints`);
            }
          } catch (error) {
            errors = JSON.stringify(error);
          }

          haveUpdated = true;
          return { ...seriesInstanceData, data, errors };
        }
      )
    );

    if (haveUpdated) {
      this.setState({ data });
    }
  }

  public render() {
    let plotData: Serie[] = this.props.seriesInstanceProps.map(
      (seriesInstanceProps): Serie => {
        const dataDefinition = new SeriesInstanceDataDefinition(
          seriesInstanceProps.seriesIdentifier.streamName,
          seriesInstanceProps.startDate,
          this.props.viewSpan,
          this.props.timezone
        );
        const dataSeriesInstance = this.state.data.find(
          data => data.data && !data.errors && data.definition.equals(dataDefinition)
        );

        return {
          id: seriesInstanceProps.seriesIdentifier.name,
          data: dataSeriesInstance && dataSeriesInstance.data ? dataSeriesInstance.data : [],
        };
      }
    );

    return (
      <ResponsiveScatterPlotCanvas
        data={plotData}
        colors={
          this.props.seriesInstanceProps.length
            ? this.props.seriesInstanceProps.map(series => series.color.hexColor)
            : { scheme: "nivo" }
        }
        // margin is required to show axis labels and legend
        margin={{ top: 10, right: 140, bottom: 70, left: 90 }}
        xScale={({ type: "linear", min: "auto", max: "auto" } as any) as Scale}
        yScale={({ type: "linear", min: 0, max: "auto" } as any) as Scale}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "X axis label",
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
            symbolShape: "rect",
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    );
  }
}

export default Plot;
