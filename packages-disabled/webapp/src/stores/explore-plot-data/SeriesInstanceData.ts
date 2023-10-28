import { Datum } from "@nivo/scatterplot";
import SeriesInstanceDataDefinition from "./SeriesInstanceDataDefinition";

export default interface SeriesInstanceData {
  definition: SeriesInstanceDataDefinition;
  data?: Datum[];
  errors?: string;
  min?: number;
  max?: number;
}
