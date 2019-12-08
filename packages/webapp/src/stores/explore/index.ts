import { action, observable } from "mobx";

import { RootStore } from "../stores";

import SeriesIdentifier from "./SeriesIdentifier";
import SeriesInstanceProps from "./SeriesInstanceProps";
import Timezone, { Timezones } from "./Timezone";
import ViewSpan, { ViewSpans } from "./ViewSpan";

export class ExploreStore {
  private rootStore: RootStore;
  private nextSeriesInstanceId: number;

  public constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.nextSeriesInstanceId = 0;
  }

  // Timezone
  @observable timezone: Timezone = Timezone.Local;
  @action setTimezone(timezone: Timezone) {
    this.timezone = timezone;
  }

  // ViewSpan
  @observable viewSpan: ViewSpan = ViewSpan.Day;
  @action setViewSpan(viewSpan: ViewSpan) {
    this.viewSpan = viewSpan;
  }

  // AvailableSeries
  availableSeries?: SeriesIdentifier[] = undefined;

  // SeriesInstanceProps
  readonly seriesInstanceProps = observable.array<SeriesInstanceProps>([]);

  @action
  addSeriesInstance(
    streamName: string,
    startDate: string,
    colorIndex?: number,
    shouldFailSilently: boolean = false
  ) {
    const thermostatConfigurationStore = this.rootStore.thermostatConfigurationStore;

    if (thermostatConfigurationStore.state !== "ready") {
      if (!shouldFailSilently) {
        throw new Error(`Unexpected: available series should be loaded`);
      }
      return;
    }

    const instanceId = this.nextSeriesInstanceId;
    ++this.nextSeriesInstanceId;

    const seriesIdentifier = thermostatConfigurationStore.thermostatConfigurations.find(
      series => series.streamName === streamName
    );

    if (!seriesIdentifier) {
      if (!shouldFailSilently) {
        throw new Error(`Unexpected: stream ${streamName} should be in available series.`);
      }
      return;
    }

    const seriesInstance: SeriesInstanceProps = {
      instanceId,
      seriesIdentifier,
      colorIndex: colorIndex || instanceId,
      startDate,
    };

    this.seriesInstanceProps.push(seriesInstance);
  }

  @action
  updateSeriesInstance(updatedSeriesInstanceProps: SeriesInstanceProps) {
    const updatedSeriesIndex = this.seriesInstanceProps.findIndex(
      series => series.instanceId === updatedSeriesInstanceProps.instanceId
    );

    this.seriesInstanceProps[updatedSeriesIndex] = updatedSeriesInstanceProps;
  }

  @action
  removeSeriesInstance(removedSeriesInstanceProps: SeriesInstanceProps) {
    this.seriesInstanceProps.remove(removedSeriesInstanceProps);
  }

  // URL persistence helpers
  public toURLString() {
    let urlParams: any = {
      view: this.viewSpan,
      tz: this.timezone,
    };

    // Per-series instance parameters
    this.seriesInstanceProps.forEach(seriesInstanceProps => {
      urlParams[
        "ts." + seriesInstanceProps.seriesIdentifier.streamName
      ] = `${seriesInstanceProps.startDate}_${seriesInstanceProps.colorIndex}`;
    });

    return "?" + new URLSearchParams(urlParams).toString();
  }

  @action
  public fromURLString(searchString: string) {
    const urlParams = new URLSearchParams(searchString);

    for (const [key, value] of urlParams.entries()) {
      if (key === "view") {
        const viewSpan = ViewSpans.find((viewSpan): boolean => viewSpan === value);

        if (viewSpan) {
          this.viewSpan = viewSpan;
        }
      } else if (key === "tz") {
        const timezone = Timezones.find((timezone): boolean => timezone === value);

        if (timezone) {
          this.timezone = timezone;
        }
      } else if (key.startsWith("ts.")) {
        // Rehydrate series instance
        const streamName = key.substr("ts.".length);
        const [startDate, colorIndex] = value.split("_");

        this.addSeriesInstance(
          streamName,
          startDate,
          parseInt(colorIndex),
          true /* shouldFailSilently */
        );
      }
    }
  }
}
