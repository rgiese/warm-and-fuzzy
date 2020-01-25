import * as GraphQL from "./generated/graphqlClient";

import {
  ThermostatSetting,
  ThermostatSettings,
  ThermostatSettingsStore,
} from "./stores/thermostatSettings";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import cloneDeep from "clone-deep";
import fastCompare from "react-fast-compare";
import moment from "moment";

//
// Local helpers
//

const compareMaybeDate = (lhs: Date | undefined | null, rhs: Date | undefined | null): number => {
  if ((lhs?.valueOf() || 0) < (rhs?.valueOf() || 0)) {
    return -1;
  }
  if ((lhs?.valueOf() || 0) > (rhs?.valueOf() || 0)) {
    return 1;
  }
  return 0;
};

const compareMaybeNumber = (
  lhs: number | null | undefined,
  rhs: number | null | undefined
): number => {
  if ((lhs || 0) < (rhs || 0)) {
    return -1;
  }
  if ((lhs || 0) > (rhs || 0)) {
    return 1;
  }
  return 0;
};

export namespace ThermostatSettingsHelpers {
  //
  // IndexedThermostatSetting
  //

  export type IndexedThermostatSetting = ThermostatSetting & { index: number };

  //
  // MutableSettingsStore
  //

  export class MutableSettingsStore {
    public readonly orderedSettings: IndexedThermostatSetting[];
    public readonly newHoldSettingTemplate: IndexedThermostatSetting;
    public readonly newScheduledSettingTemplate: IndexedThermostatSetting;

    private readonly thermostatSettingsStore: ThermostatSettingsStore;
    private readonly thermostatSettings: ThermostatSettings;
    private readonly setIsSaving: (isSaving: boolean) => void;

    private readonly indexedSettings: IndexedThermostatSetting[];

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
        (thermostatSetting, index): IndexedThermostatSetting => {
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

      const newHoldSettingTemplateBase =
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

      // Whichever source the new hold setting comes from, default to expiring four hours from now
      this.newHoldSettingTemplate = {
        ...newHoldSettingTemplateBase,
        holdUntil: moment()
          .add(4, "hours")
          .toDate(),
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

    //
    // Mutation callbacks
    //

    public async onSave(updatedThermostatSetting: IndexedThermostatSetting): Promise<void> {
      return this.onMutate(
        (mutatedSettingsArray: IndexedThermostatSetting[]): IndexedThermostatSetting[] => {
          mutatedSettingsArray[updatedThermostatSetting.index] = updatedThermostatSetting;
          return mutatedSettingsArray;
        }
      );
    }

    public async onAdd(addedThermostatSetting: IndexedThermostatSetting): Promise<void> {
      return this.onMutate(
        (mutatedSettingsArray: IndexedThermostatSetting[]): IndexedThermostatSetting[] => {
          if (addedThermostatSetting.type === GraphQL.ThermostatSettingType.Hold) {
            // Adding a new Hold -> remove any existing expired Hold settings
            mutatedSettingsArray = mutatedSettingsArray.filter(
              setting =>
                // Keep all non-Hold settings
                setting.type !== GraphQL.ThermostatSettingType.Hold ||
                // Keep Hold settings that expire in the future
                (setting.holdUntil && setting.holdUntil.valueOf() >= Date.now())
            );
          }

          mutatedSettingsArray.push(addedThermostatSetting);
          return mutatedSettingsArray;
        }
      );
    }

    public async onRemove(removedThermostatSetting: IndexedThermostatSetting): Promise<void> {
      return this.onMutate(
        (mutatedSettingsArray: IndexedThermostatSetting[]): IndexedThermostatSetting[] => {
          mutatedSettingsArray.splice(removedThermostatSetting.index, 1);
          return mutatedSettingsArray;
        }
      );
    }

    private async onMutate(
      mutateFn: (mutatedSettingsArray: IndexedThermostatSetting[]) => IndexedThermostatSetting[]
    ): Promise<void> {
      this.setIsSaving(true);

      // Create local copy of settings array to update
      const mutatedSettingsArray = this.indexedSettings.slice();

      // Mutate array
      const updatedSettingsArray = mutateFn(mutatedSettingsArray);

      // Project array of IndexedThermostatSetting back to ThermostatSetting
      const mutatedSettings: ThermostatSettings = {
        ...this.thermostatSettings,
        settings: updatedSettingsArray.map(setting => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { index, ...rest } = setting;
          return { ...rest };
        }),
      };

      // Update in store
      await this.thermostatSettingsStore.updateItem(mutatedSettings);

      this.setIsSaving(false);
    }
  }

  //
  // HoldUntil
  //

  export const HoldUntilForeverSentinel = new Date(Math.pow(2, 31) * 1000); // cheap sentinel value - close enough...

  export const HoldUntilHoursFromNowOptions = [1, 2, 4, 8, 12, 24];

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
