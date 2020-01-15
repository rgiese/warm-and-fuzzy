import moment from "moment";
import fastCompare from "react-fast-compare";
import cloneDeep from "clone-deep";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "./generated/graphqlClient";

import {
  ThermostatSettings,
  ThermostatSetting,
  ThermostatSettingsStore,
} from "./stores/thermostatSettings";
import { compareMaybeDate, compareMaybeNumber } from "./compareHelpers";

export namespace ThermostatSettingsHelpers {
  //
  // IndexedThermostatSetting
  //

  export type IndexedThermostatSetting = ThermostatSetting & { index: number };

  //
  // MutableSettingsStore
  //

  export class MutableSettingsStore {
    public constructor(
      thermostatSettingsStore: ThermostatSettingsStore,
      thermostatSettings: ThermostatSettings,
      setIsSaving: (isSaving: boolean) => void
    ) {
      this.thermostatSettingsStore = thermostatSettingsStore;
      this.thermostatSettings = thermostatSettings;
      this.setIsSaving = setIsSaving;

      // Deep-clone settings array so we can sort it here and mutate it in child components;
      // also inject indexes to map settings back to store definition.
      // (Deep-cloning may be overkill, but we want to be sure not to mutate the store directly at any point.)
      this.indexedSettings = cloneDeep(thermostatSettings.settings).map(
        (thermostatSetting, index): ThermostatSettingsHelpers.IndexedThermostatSetting => {
          return { ...thermostatSetting, index };
        }
      );

      const holdSettings = this.indexedSettings
        .filter(setting => setting.type === GraphQL.ThermostatSettingType.Hold)
        .sort((lhs, rhs): number => compareMaybeDate(lhs.holdUntil, rhs.holdUntil));

      const scheduledSettings = this.indexedSettings
        .filter(setting => setting.type === GraphQL.ThermostatSettingType.Scheduled)
        .sort((lhs, rhs): number =>
          compareMaybeNumber(lhs.atMinutesSinceMidnight, rhs.atMinutesSinceMidnight)
        );

      this.orderedSettings = holdSettings.concat(scheduledSettings);

      this.newHoldSettingTemplate =
        holdSettings.length > 0
          ? holdSettings[holdSettings.length - 1]
          : {
              type: GraphQL.ThermostatSettingType.Hold,
              index: -1,
              // Hold settings
              holdUntil: new Date(),
              // Scheduled settings
              atMinutesSinceMidnight: 0,
              daysOfWeek: [],
              // For all types
              allowedActions: [],
              setPointHeat: 18,
              setPointCool: 22,
            };

      this.newScheduledSettingTemplate =
        scheduledSettings.length > 0
          ? scheduledSettings[scheduledSettings.length - 1]
          : {
              type: GraphQL.ThermostatSettingType.Scheduled,
              index: -1,
              // Hold settings
              holdUntil: new Date(0),
              // Scheduled settings
              atMinutesSinceMidnight: 0,
              daysOfWeek: ThermostatSettingSchema.DaysOfWeek,
              // For all types
              allowedActions: [],
              setPointHeat: 18,
              setPointCool: 22,
            };
    }

    private readonly thermostatSettingsStore: ThermostatSettingsStore;
    private readonly thermostatSettings: ThermostatSettings;
    private readonly setIsSaving: (isSaving: boolean) => void;

    private readonly indexedSettings: IndexedThermostatSetting[];

    readonly orderedSettings: IndexedThermostatSetting[];
    readonly newHoldSettingTemplate: IndexedThermostatSetting;
    readonly newScheduledSettingTemplate: IndexedThermostatSetting;

    //
    // Mutation callbacks
    //

    private async onMutate(
      mutateFn: (mutatedSettingsArray: IndexedThermostatSetting[]) => void
    ): Promise<void> {
      this.setIsSaving(true);

      // Create local copy of settings array to update
      const mutatedSettingsArray = this.indexedSettings.slice();

      // Swap in changed element
      mutateFn(mutatedSettingsArray);

      // Project array of IndexedThermostatSetting back to ThermostatSetting
      const mutatedSettings: ThermostatSettings = {
        ...this.thermostatSettings,
        settings: mutatedSettingsArray.map(setting => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { index, ...rest } = setting;
          return { ...rest };
        }),
      };

      // Update in store
      await this.thermostatSettingsStore.updateItem(mutatedSettings);

      this.setIsSaving(false);
    }

    async onSave(
      updatedThermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting
    ): Promise<void> {
      return this.onMutate(
        (mutatedSettingsArray: ThermostatSettingsHelpers.IndexedThermostatSetting[]) =>
          (mutatedSettingsArray[updatedThermostatSetting.index] = updatedThermostatSetting)
      );
    }

    async onAdd(
      addedThermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting
    ): Promise<void> {
      return this.onMutate(
        (mutatedSettingsArray: ThermostatSettingsHelpers.IndexedThermostatSetting[]) =>
          mutatedSettingsArray.push(addedThermostatSetting)
      );
    }

    async onRemove(
      removedThermostatSetting: ThermostatSettingsHelpers.IndexedThermostatSetting
    ): Promise<void> {
      return this.onMutate(
        (mutatedSettingsArray: ThermostatSettingsHelpers.IndexedThermostatSetting[]) =>
          mutatedSettingsArray.splice(removedThermostatSetting.index, 1)
      );
    }
  }

  //
  // HoldUntil
  //

  export const HoldUntilForeverSentinel = new Date(Math.pow(2, 31) * 1000); // cheap sentinel value - close enough...

  export const FormatHoldUntil = (holdUntil: Date): string => {
    if (holdUntil.valueOf() < Date.now()) {
      return "(expired)";
    }
    if (holdUntil.valueOf() >= HoldUntilForeverSentinel.valueOf()) {
      return "forever";
    }
    return `until ${moment(holdUntil).fromNow(true)} from now`;
  };

  //
  // DaysOfWeek
  //

  export const IsWeekend = (dayOfWeek: GraphQL.DayOfWeek): boolean => {
    return [GraphQL.DayOfWeek.Saturday, GraphQL.DayOfWeek.Sunday].includes(dayOfWeek);
  };

  export const WeekdayDays = ThermostatSettingSchema.DaysOfWeek.filter(
    dayOfWeek => !IsWeekend(dayOfWeek)
  );
  export const WeekendDays = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek =>
    IsWeekend(dayOfWeek)
  );

  export const FormatDaysOfWeekList = (daysOfWeek: GraphQL.DayOfWeek[]): string => {
    // Rebuild in-day-order array for display and comparison purposes since they may be returned in arbitrary order
    const inOrderDaysOfWeek = ThermostatSettingSchema.DaysOfWeek.filter(dayOfWeek =>
      daysOfWeek.includes(dayOfWeek)
    );

    if (inOrderDaysOfWeek.length === ThermostatSettingSchema.DaysOfWeek.length) {
      return "Everyday";
    }

    if (fastCompare(inOrderDaysOfWeek, WeekdayDays)) {
      return "Weekdays";
    }

    if (fastCompare(inOrderDaysOfWeek, WeekendDays)) {
      return "Weekends";
    }

    return inOrderDaysOfWeek.map(day => day.substr(0, 3)).join(", ");
  };

  //
  // AtMinutesSinceMidnight
  //

  export const FormatMinutesSinceMidnight = (value: number): string =>
    String(Math.floor(value / 60)).padStart(2, "0") +
    ":" +
    String(Math.round(value % 60)).padStart(2, "0");

  export const ParseMinutesSinceMidnight = (value: string): number => {
    const [hours, minutes] = value.split(":");
    return Number.parseInt(hours) * 60 + Number.parseInt(minutes);
  };
}
