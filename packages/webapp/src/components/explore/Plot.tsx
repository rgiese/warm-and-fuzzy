import React from "react";
import { Dimmer, Loader, Message } from "semantic-ui-react";
import { observer } from "mobx-react";

import { ResponsiveScatterPlotCanvas, Scale, Serie } from "@nivo/scatterplot";
import { LinearScale, TimeScale } from "@nivo/scales";
import { AxisProps } from "@nivo/axes";

import SeriesColorPalette from "./SeriesColorPalette";
import PlotTooltip from "./PlotTooltip";
import ViewSpan from "../../stores/explore/ViewSpan";

import { ExploreStore, ExplorePlotDataStore } from "../../stores/stores";
import SeriesInstanceDataDefinition from "../../stores/explore-plot-data/SeriesInstanceDataDefinition";

interface Props {
  exploreStore: ExploreStore;
  explorePlotDataStore: ExplorePlotDataStore;
}

const Plot: React.FunctionComponent<Props> = observer(
  (props): React.ReactElement => {
    const exploreStore = props.exploreStore;
    const explorePlotDataStore = props.explorePlotDataStore;

    // Pick reasonable Y-axis defaults considering interior temperature ranges
    let plotMin = 16;
    let plotMax = 36;

    const plotData: Serie[] = exploreStore.seriesInstanceProps.map(
      (seriesInstanceProps): Serie => {
        const dataDefinition = new SeriesInstanceDataDefinition(
          seriesInstanceProps.seriesIdentifier.streamName,
          seriesInstanceProps.startDate,
          exploreStore.viewSpan,
          exploreStore.timezone
        );

        const dataSeriesInstance = explorePlotDataStore.seriesInstanceDatas.find(
          data => data.definition.equals(dataDefinition) && data.data && !data.errors
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

    const errors = explorePlotDataStore.seriesInstanceDatas
      .map(seriesInstanceData => seriesInstanceData.errors)
      .filter(error => error !== undefined);

    const isLoading =
      explorePlotDataStore.seriesInstanceDatas
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
);

export default Plot;
