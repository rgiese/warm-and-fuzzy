import { ViewSpan, ViewSpans, Timezone, Timezones } from "./Plot";
import SeriesColorPalette from "./SeriesColorPalette";
import SeriesIdentifier from "./SeriesIdentifier";
import SeriesInstanceProps from "./SeriesInstanceProps";

export interface State {
  viewSpan: ViewSpan;
  timezone: Timezone;

  availableSeries?: SeriesIdentifier[];
  seriesInstanceProps: SeriesInstanceProps[];
}

export function ToSearchParams(state: State): string {
  // Page-wide parameters
  let urlParams: any = {
    view: state.viewSpan,
    tz: state.timezone,
  };

  // Per-series instance parameters
  state.seriesInstanceProps.forEach(seriesInstanceProps => {
    const colorPaletteIndex = SeriesColorPalette.findIndex(
      color => color.semanticColor === seriesInstanceProps.color.semanticColor
    );

    urlParams[
      "ts." + seriesInstanceProps.seriesIdentifier.streamName
    ] = `${seriesInstanceProps.startDate}_${colorPaletteIndex}`;
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
    colorPaletteIndex: number,
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
      const [startDate, colorPaletteIndex] = value.split("_");

      onAddSeriesInstance(
        streamName,
        startDate,
        parseInt(colorPaletteIndex),
        true /* shouldFailSilently */
      );
    }
  }
}
