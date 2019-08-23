import React from "react";
import { Container } from "semantic-ui-react";
import { ResponsiveScatterPlotCanvas, Scale, Serie } from "@nivo/scatterplot";

import Plot from "react-plotly.js";
import * as Plotly from "plotly.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {}

class Explore extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  public render(): React.ReactElement {
    const data: Serie[] = [
      { id: "a", data: [{ x: 10, y: 1 }, { x: 12, y: 2 }, { x: 13, y: 5 }] },
      { id: "b", data: [{ x: 11, y: 2 }, { x: 12, y: 4 }, { x: 13, y: 1 }] },
    ];

    const plotlyData: Partial<Plotly.PlotData>[] = [
      {
        x: [10, 12, 13],
        y: [1, 2, 5],
        type: "scatter",
        mode: "markers",
        name: "thing A",
        marker: { color: "red", opacity: 0.5, size: 12 },
      },
      {
        x: [11, 12, 13],
        y: [2, 4, 1],
        type: "scatter",
        mode: "markers",
        marker: { color: "blue" },
      },
    ];

    return (
      <Container style={{ height: "40em" }}>
        <Plot
          data={plotlyData}
          layout={{ title: "A Fancy Plot" }}
          config={{ responsive: true, displaylogo: false }}
        />

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
    );
  }
}

export default Explore;
