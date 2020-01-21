import Timezone from "../explore/Timezone";
import ViewSpan from "../explore/ViewSpan";

export default class SeriesInstanceDataDefinition {
  public streamName: string;
  public startDate: string;
  public viewSpan: ViewSpan;
  public timezone: Timezone;

  public constructor(
    streamName: string,
    startDate: string,
    viewSpan: ViewSpan,
    timezone: Timezone
  ) {
    this.streamName = streamName;
    this.startDate = startDate;
    this.viewSpan = viewSpan;
    this.timezone = timezone;
  }

  public toString(): string {
    return `${this.streamName}@${this.startDate}.${this.timezone}.${this.viewSpan}`;
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
