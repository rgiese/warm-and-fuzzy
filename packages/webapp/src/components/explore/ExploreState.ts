import SeriesInstanceProps from "./SeriesInstanceProps";
import Timezone, { Timezones } from "../../stores/explore/Timezone";
import ViewSpan, { ViewSpans } from "../../stores/explore/ViewSpan";

export function ToSearchParams(
  viewSpan: ViewSpan,
  timezone: Timezone,
  seriesInstanceProps: SeriesInstanceProps[]
): string {
  // Page-wide parameters
  let urlParams: any = {
    view: viewSpan,
    tz: timezone,
  };

  // Per-series instance parameters
  seriesInstanceProps.forEach(seriesInstanceProps => {
    urlParams[
      "ts." + seriesInstanceProps.seriesIdentifier.streamName
    ] = `${seriesInstanceProps.startDate}_${seriesInstanceProps.colorIndex}`;
  });

  return new URLSearchParams(urlParams).toString();
}

export function FromSearchParams(
  searchString: string,
  onUpdateViewSpan: (viewSpan: ViewSpan) => void,
  onUpdateTimezone: (timezone: Timezone) => void,
  onAddSeriesInstance: (
    streamName: string,
    startDate: string,
    colorIndex: number,
    shouldFailSilently: boolean
  ) => void
): void {
  const urlParams = new URLSearchParams(searchString);

  for (const [key, value] of urlParams.entries()) {
    if (key === "view") {
      const viewSpan = ViewSpans.find((viewSpan): boolean => viewSpan === value);

      if (viewSpan) {
        onUpdateViewSpan(viewSpan);
      }
    } else if (key === "tz") {
      const timezone = Timezones.find((timezone): boolean => timezone === value);

      if (timezone) {
        onUpdateTimezone(timezone);
      }
    } else if (key.startsWith("ts.")) {
      // Rehydrate series instance
      const streamName = key.substr("ts.".length);
      const [startDate, colorIndex] = value.split("_");

      onAddSeriesInstance(
        streamName,
        startDate,
        parseInt(colorIndex),
        true /* shouldFailSilently */
      );
    }
  }
}
