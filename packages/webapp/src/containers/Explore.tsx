import React from "react";
import { Container, Dropdown, DropdownProps, Message, Segment } from "semantic-ui-react";

import gql from "graphql-tag";
import { ResponsiveScatterPlotCanvas, Scale, Serie } from "@nivo/scatterplot";

import SeriesColorPalette from "../components/explore/SeriesColorPalette";
import SeriesIdentifier from "../components/explore/SeriesIdentifier";
import SeriesInstanceBean from "../components/explore/SeriesInstanceBean";
import SeriesInstanceProps from "../components/explore/SeriesInstanceProps";

import {
  ExploreThermostatConfigurationsDocument,
  ExploreThermostatConfigurationsQuery,
} from "../generated/graphqlClient";
import ApolloClient from "../services/ApolloClient";

gql`
  query ExploreThermostatConfigurations {
    getThermostatConfigurations {
      id
      name
      streamName
    }
  }
`;

enum ViewSpan {
  Day = "day",
  Week = "week",
}

enum Timezone {
  Local = "local",
  UTC = "UTC",
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {
  public constructor() {
    this.viewSpan = ViewSpan.Day;
    this.timezone = Timezone.Local;

    this.availableSeries = [];
    this.seriesInstanceProps = [];
  }

  viewSpan: ViewSpan;
  timezone: Timezone;

  availableSeries: SeriesIdentifier[];
  seriesInstanceProps: SeriesInstanceProps[];

  errors?: string;
}

class Explore extends React.Component<Props, State> {
  private nextSeriesInstanceId: number;

  public constructor(props: Props) {
    super(props);
    this.state = new State();
    this.nextSeriesInstanceId = 0;
  }

  async componentDidMount(): Promise<void> {
    // Obtain thermostat configuration
    try {
      const queryResult = await ApolloClient.query<ExploreThermostatConfigurationsQuery, {}>({
        query: ExploreThermostatConfigurationsDocument,
      });

      if (queryResult.errors) {
        this.setState({ errors: JSON.stringify(queryResult.errors) });
      }

      if (!queryResult.data || !queryResult.data.getThermostatConfigurations) {
        this.setState({ errors: "No data returned" });
      }

      let availableSeries: SeriesIdentifier[] = queryResult.data.getThermostatConfigurations
        .map(s => {
          return { id: s.id, name: s.name, streamName: s.streamName };
        })
        .sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));

      this.setState({ availableSeries });
    } catch (error) {
      this.setState({ errors: JSON.stringify(error) });
    }
  }

  private handleSeriesInstanceAdded = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ): void => {
    const instanceId = this.nextSeriesInstanceId;
    ++this.nextSeriesInstanceId;

    const streamName = data.value as string; // see Dropdown key definition below
    const seriesIdentifier = this.state.availableSeries.find(
      series => series.streamName === streamName
    );

    if (!seriesIdentifier) {
      throw new Error(`Unexpected: stream ${streamName} should be in available series.`);
    }

    const addedSeriesInstance: SeriesInstanceProps = {
      instanceId,
      seriesIdentifier,
      color: SeriesColorPalette[instanceId % SeriesColorPalette.length],
      startDate: new Date(),
    };

    this.setState({
      seriesInstanceProps: [...this.state.seriesInstanceProps, addedSeriesInstance],
    });
  };

  private handleSeriesInstanceChanged = (data: SeriesInstanceProps): void => {
    let seriesInstanceProps = this.state.seriesInstanceProps;

    const changedSeriesIndex = seriesInstanceProps.findIndex(
      series => series.instanceId === data.instanceId
    );
    seriesInstanceProps[changedSeriesIndex] = data;

    this.setState({ seriesInstanceProps: seriesInstanceProps });
  };

  private handleSeriesInstanceRemoved = (data: SeriesInstanceProps): void => {
    let seriesProps = this.state.seriesInstanceProps;

    const removedSeriesInstanceIndex = seriesProps.findIndex(
      series => series.instanceId === data.instanceId
    );
    seriesProps.splice(removedSeriesInstanceIndex, 1);

    this.setState({ seriesInstanceProps: seriesProps });
  };

  public render(): React.ReactElement {
    const data: Serie[] = [
      { id: "a", data: [{ x: 10, y: 1 }, { x: 12, y: 2 }, { x: 13, y: 5 }] },
      { id: "b", data: [{ x: 11, y: 2 }, { x: 12, y: 4 }, { x: 13, y: 1 }] },
    ];

    return (
      <Container>
        {this.state.errors && <Message negative content={this.state.errors} />}
        <Segment>
          {/* View settings */}
          Show data for a{` `}
          <Dropdown
            inline
            header="Choose time span"
            options={[ViewSpan.Day, ViewSpan.Week].map(v => {
              return { key: v, value: v, text: v };
            })}
            value={this.state.viewSpan}
            onChange={(_event, data) => this.setState({ viewSpan: data.value as ViewSpan })}
          />
          in{` `}
          <Dropdown
            inline
            header="Choose time zone"
            options={[Timezone.Local, Timezone.UTC].map(tz => {
              return { key: tz, value: tz, text: tz };
            })}
            value={this.state.timezone}
            onChange={(_event, data) => this.setState({ timezone: data.value as Timezone })}
          />
          time.
        </Segment>
        <Container style={{ height: "40em" }}>
          {" "}
          {/* TODO: flexbox this */}
          <ResponsiveScatterPlotCanvas
            data={data}
            colors={
              this.state.seriesInstanceProps.length
                ? this.state.seriesInstanceProps.map(series => series.color.hexColor)
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
        </Container>
        <Container>
          {/* Series instance beans */}
          {this.state.seriesInstanceProps.map(series => (
            <SeriesInstanceBean
              key={series.instanceId}
              seriesInstanceProps={series}
              onChanged={this.handleSeriesInstanceChanged}
              onRemoved={this.handleSeriesInstanceRemoved}
              showingSingleDay={this.state.viewSpan === ViewSpan.Day}
              padding={6}
            />
          ))}
          {/* Add series instance button */}
          <Dropdown
            style={{ padding: 12 }}
            button
            className="icon"
            icon="add"
            labeled
            text="Add series"
            search
            options={this.state.availableSeries.map(s => {
              return { key: s.streamName, value: s.streamName, text: s.name };
            })}
            onChange={this.handleSeriesInstanceAdded}
            value="" // Control component so selecting the same item twice in a row still triggers `onChange`
          />
        </Container>
      </Container>
    );
  }
}

export default Explore;
