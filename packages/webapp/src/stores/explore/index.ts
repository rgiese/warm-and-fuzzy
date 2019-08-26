import { action, observable } from "mobx";

import { RootStore } from "../stores";

import SeriesIdentifier from "./SeriesIdentifier";
import SeriesInstanceProps from "../../components/explore/SeriesInstanceProps";
import Timezone from "./Timezone";
import ViewSpan from "./ViewSpan";

export class ExploreStore {
  private rootStore: RootStore;

  public constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
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

  private nextSeriesInstanceId: number = 0;
}

// Exported by name above for the sake of ../internal.ts,
// exporting as default here for the sake of direct dependencies.
export default ExploreStore;
