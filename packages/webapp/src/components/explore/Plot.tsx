import { Dimmer, Loader, Message } from "semantic-ui-react";
import { LinearScale, TimeScale } from "@nivo/scales";
import { ResponsiveScatterPlotCanvas, Scale, Serie } from "@nivo/scatterplot";

import { AxisProps } from "@nivo/axes";
import ExplorePlotDataStore from "../../stores/explore-plot-data";
import ExploreStore from "../../stores/explore";
import PlotTooltip from "./PlotTooltip";
import React from "react";
import SeriesColorPalette from "./SeriesColorPalette";
import SeriesInstanceDataDefinition from "../../stores/explore-plot-data/SeriesInstanceDataDefinition";
import ViewSpan from "../../stores/explore/ViewSpan";
import { observer } from "mobx-react";

const Plot: React.FunctionComponent<{
  exploreStore: ExploreStore;
  explorePlotDataStore: ExplorePlotDataStore;
}> = observer(
  ({ exploreStore, explorePlotDataStore }): React.ReactElement => {
    // Pick reasonable Y-axis defaults considering interior temperature ranges
    let plotMin = 16;
    let plotMax = 36;

    let isLoading = false;
    const errors: string[] = [];

    const plotData: Serie[] = exploreStore.seriesInstanceProps.map(
      (seriesInstanceProps): Serie => {
        const dataDefinition = new SeriesInstanceDataDefinition(
          seriesInstanceProps.seriesIdentifier.streamName,
          seriesInstanceProps.startDate,
          exploreStore.viewSpan,
          exploreStore.timezone
        );

        const dataSeriesInstance = explorePlotDataStore.seriesInstanceDatas.get(
          dataDefinition.toString()
        );

        // begin side effects
        if (!dataSeriesInstance) {
          isLoading = true;
        } else if (dataSeriesInstance.errors) {
          errors.push(dataSeriesInstance.errors);
        }
        // end side effects

        const id =
          seriesInstanceProps.seriesIdentifier.name + ` (${seriesInstanceProps.startDate})`;

        plotMin = dataSeriesInstance?.min ? Math.min(plotMin, dataSeriesInstance.min) : plotMin;
        plotMax = dataSeriesInstance?.max ? Math.max(plotMax, dataSeriesInstance.max) : plotMax;

        return {
          id,
          data: dataSeriesInstance?.data ? dataSeriesInstance.data : [],
        };
      }
    );

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
      tickValues: `every ${exploreStore.viewSpan === ViewSpan.Day ? 2 : 12} hours`,
    };

    const yScale: LinearScale = {
      type: "linear",
      min: plotMin,
      max: plotMax,
    };

    const colors: string[] = exploreStore.seriesInstanceProps.map(
      series => SeriesColorPalette[series.colorIndex % SeriesColorPalette.length].hexColor
    );

    return (
      <Dimmer.Dimmable blurring style={{ width: "100%", height: "100%" }}>
        <Dimmer active={isLoading} inverted>
          <Loader content="Loading" />
        </Dimmer>
        {errors && errors.length > 0 && (
          <Message header="Errors fetching data" list={errors} negative />
        )}
        <ResponsiveScatterPlotCanvas
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
          colors={colors}
          // margin is required to show axis labels and legend
          data={plotData}
          // https://github.com/plouc/nivo/issues/674 for scale casting
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
          margin={{ top: 10, right: 240, bottom: 70, left: 90 }}
          nodeSize={6}
          tooltip={PlotTooltip}
          // https://github.com/d3/d3-format
          xFormat={`time:${timeFormat}`}
          xScale={(xScale as any) as Scale}
          yFormat=".1f"
          yScale={(yScale as any) as Scale}
        />
      </Dimmer.Dimmable>
    );
  }
);

export default Plot;
