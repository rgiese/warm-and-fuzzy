import { Flatbuffers } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../../generated/graphqlTypes";

const mapModelToFirmwareEnum = new Map<GraphQL.DayOfWeek, Flatbuffers.Firmware.DaysOfWeek>([
  [GraphQL.DayOfWeek.Monday, Flatbuffers.Firmware.DaysOfWeek.Monday],
  [GraphQL.DayOfWeek.Tuesday, Flatbuffers.Firmware.DaysOfWeek.Tuesday],
  [GraphQL.DayOfWeek.Wednesday, Flatbuffers.Firmware.DaysOfWeek.Wednesday],
  [GraphQL.DayOfWeek.Thursday, Flatbuffers.Firmware.DaysOfWeek.Thursday],
  [GraphQL.DayOfWeek.Friday, Flatbuffers.Firmware.DaysOfWeek.Friday],
  [GraphQL.DayOfWeek.Saturday, Flatbuffers.Firmware.DaysOfWeek.Saturday],
  [GraphQL.DayOfWeek.Sunday, Flatbuffers.Firmware.DaysOfWeek.Sunday],
]);

const throwUndefinedModelDay = (d: GraphQL.DayOfWeek): Flatbuffers.Firmware.DaysOfWeek => {
  throw new Error(`Unrecognized day '${d}'`);
};

export function firmwareFromModel(
  daysOfWeek?: Set<GraphQL.DayOfWeek>
): Flatbuffers.Firmware.DaysOfWeek {
  if (daysOfWeek) {
    return Array.from(daysOfWeek)
      .map(
        (d): Flatbuffers.Firmware.DaysOfWeek =>
          mapModelToFirmwareEnum.get(d) || throwUndefinedModelDay(d)
      )
      .reduce((accumulatedValue, currentValue) => accumulatedValue | currentValue);
  } else {
    return 0;
  }
}
