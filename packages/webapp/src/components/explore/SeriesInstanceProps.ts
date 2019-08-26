import SeriesIdentifier from "./SeriesIdentifier";

export const SeriesInstanceDateFormat = "YYYY-MM-DD"; // ISO 8601 so it auto-parses

export default interface SeriesInstanceProps {
  instanceId: number;
  seriesIdentifier: SeriesIdentifier;
  colorIndex: number;
  startDate: string; // string-formatted as SeriesInstanceDateFormat rather than Date() to avoid timezone madness
}
