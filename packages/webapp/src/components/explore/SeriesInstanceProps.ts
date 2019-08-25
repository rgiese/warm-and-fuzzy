import SeriesColor from "./SeriesColor";
import SeriesIdentifier from "./SeriesIdentifier";

export default interface SeriesInstanceProps {
  instanceId: number;
  seriesIdentifier: SeriesIdentifier;
  color: SeriesColor;
  startDate: string; // formatted as YYYY-MM-DD
}