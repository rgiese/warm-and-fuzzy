import React from "react";
import { Container, Dropdown, DropdownProps } from "semantic-ui-react";

import { ResponsiveScatterPlotCanvas, Scale, Serie } from "@nivo/scatterplot";

import ExploreSeriesBean, { SeriesProps } from "../components/ExploreSeriesBean";
import { ColorPalette } from "../components/ExploreSeriesColors";

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
    this.seriesProps = [];
  }

  viewSpan: ViewSpan;
  timezone: Timezone;

  availableSeries: string[];
  seriesProps: SeriesProps[];
}

class Explore extends React.Component<Props, State> {
  private nextSeriesId: number;

  public constructor(props: Props) {
    super(props);
    this.state = new State();
    this.nextSeriesId = 0;
  }

  componentDidMount() {
    this.setState({ availableSeries: ["Mango", "Kiwi", "Banana", "Jackfruit"] });
  }

  private handleSeriesAdded = (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ): void => {
    const seriesId = this.nextSeriesId;
    ++this.nextSeriesId;

    const addedSeries: SeriesProps = {
      id: seriesId,
      name: data.value as string,
      color: ColorPalette[seriesId % ColorPalette.length],
      startDate: new Date(),
    };

    this.setState({ seriesProps: [...this.state.seriesProps, addedSeries] });
  };

  private handleSeriesChanged = (data: SeriesProps): void => {
    let seriesProps = this.state.seriesProps;

    const changedSeriesIndex = seriesProps.findIndex(series => series.id === data.id);
    seriesProps[changedSeriesIndex] = data;

    this.setState({ seriesProps });
  };

  private handleSeriesRemoved = (data: SeriesProps): void => {
    let seriesProps = this.state.seriesProps;

    const removedSeriesIndex = seriesProps.findIndex(series => series.id === data.id);
    seriesProps.splice(removedSeriesIndex, 1);

    this.setState({ seriesProps });
  };

  public render(): React.ReactElement {
    const data: Serie[] = [
      { id: "a", data: [{ x: 10, y: 1 }, { x: 12, y: 2 }, { x: 13, y: 5 }] },
      { id: "b", data: [{ x: 11, y: 2 }, { x: 12, y: 4 }, { x: 13, y: 1 }] },
    ];

    return (
      <Container>
        <Container>
          {/* View settings */}
          Show data for a{` `}
          <Dropdown
            inline
            header="Adjust time span"
            options={[ViewSpan.Day, ViewSpan.Week].map(v => {
              return { key: v, value: v, text: v };
            })}
            value={this.state.viewSpan}
            onChange={(_event, data) => this.setState({ viewSpan: data.value as ViewSpan })}
          />
          in{` `}
          <Dropdown
            inline
            header="Adjust time span"
            options={[Timezone.Local, Timezone.UTC].map(tz => {
              return { key: tz, value: tz, text: tz };
            })}
            value={this.state.timezone}
            onChange={(_event, data) => this.setState({ timezone: data.value as Timezone })}
          />
          time.
        </Container>
        <Container style={{ height: "40em" }}>
          {" "}
          {/* TODO: flexbox this */}
          <ResponsiveScatterPlotCanvas
            data={data}
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
          {/* Series beans */}
          {this.state.seriesProps.map(series => (
            <ExploreSeriesBean
              key={series.id}
              seriesProps={series}
              onChanged={this.handleSeriesChanged}
              onRemoved={this.handleSeriesRemoved}
              isSingleDay={this.state.viewSpan === ViewSpan.Day}
              padding={6}
            />
          ))}
          {/* Add series button */}
          <Dropdown
            style={{ padding: 12 }}
            button
            className="icon"
            icon="add"
            labeled
            text="Add series"
            search
            options={this.state.availableSeries.map(s => {
              return { key: s, value: s, text: s };
            })}
            onChange={this.handleSeriesAdded}
            value="" // Control component so selecting the same item twice in a row still triggers `onChange`
          />
        </Container>
      </Container>
    );
  }
}

export default Explore;
