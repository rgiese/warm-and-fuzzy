import React, { useContext, useState } from "react";
import { Header, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";

import cloneDeep from "clone-deep";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import {
  RootStoreContext,
  ThermostatSettings,
  compareMaybeDate,
  compareMaybeNumber,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../generated/graphqlClient";

import AddSettingPopup from "./thermostatSettings/AddSettingPopup";
import ThermostatSettingBean from "./thermostatSettings/ThermostatSettingBean";
import IndexedThermostatSetting from "./thermostatSettings/IndexedThermostatSetting";

const ThermostatSettingsComponent: React.FunctionComponent<{
  thermostatSettings: ThermostatSettings;
}> = ({ thermostatSettings }): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
    thermostatSettings.id
  );

  const [isSaving, setIsSaving] = useState(false);

  // Deep-clone settings array so we can sort it here and mutate it in child components;
  // also inject indexes to map settings back to store definition.
  // (Deep-cloning may be overkill, but we want to be sure not to mutate the store directly at any point.)
  const localSettingsArray = cloneDeep(thermostatSettings.settings).map(
    (thermostatSetting, index): IndexedThermostatSetting => {
      return { ...thermostatSetting, index };
    }
  );

  const holdSettings = localSettingsArray
    .filter(setting => setting.type === GraphQL.ThermostatSettingType.Hold)
    .sort((lhs, rhs): number => compareMaybeDate(lhs.holdUntil, rhs.holdUntil));

  const scheduledSettings = localSettingsArray
    .filter(setting => setting.type === GraphQL.ThermostatSettingType.Scheduled)
    .sort((lhs, rhs): number =>
      compareMaybeNumber(lhs.atMinutesSinceMidnight, rhs.atMinutesSinceMidnight)
    );

  const orderedSettings = holdSettings.concat(scheduledSettings);

  const newHoldSettingTemplate: IndexedThermostatSetting =
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

  const newScheduledSettingTemplate: IndexedThermostatSetting =
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

  const onMutate = async (
    mutateFn: (mutatedSettingsArray: IndexedThermostatSetting[]) => void
  ): Promise<void> => {
    setIsSaving(true);

    // Create local copy of settings array to update
    const mutatedSettingsArray = localSettingsArray.slice();

    // Swap in changed element
    mutateFn(mutatedSettingsArray);

    // Project array of IndexedThermostatSetting back to ThermostatSetting
    const mutatedSettings: ThermostatSettings = {
      ...thermostatSettings,
      settings: mutatedSettingsArray.map(setting => {
        const { index, ...rest } = setting;
        return { ...rest };
      }),
    };

    // Update in store
    await rootStore.thermostatSettingsStore.updateItem(mutatedSettings);

    setIsSaving(false);
  };

  const onSave = async (updatedThermostatSetting: IndexedThermostatSetting): Promise<void> => {
    return onMutate(
      (mutatedSettingsArray: IndexedThermostatSetting[]) =>
        (mutatedSettingsArray[updatedThermostatSetting.index] = updatedThermostatSetting)
    );
  };

  const onAdd = async (addedThermostatSetting: IndexedThermostatSetting): Promise<void> => {
    return onMutate((mutatedSettingsArray: IndexedThermostatSetting[]) =>
      mutatedSettingsArray.push(addedThermostatSetting)
    );
  };

  const onRemove = async (removedThermostatSetting: IndexedThermostatSetting): Promise<void> => {
    return onMutate((mutatedSettingsArray: IndexedThermostatSetting[]) =>
      mutatedSettingsArray.splice(removedThermostatSetting.index, 1)
    );
  };

  return (
    <>
      <Header as="h3" attached="top">
        {thermostatConfiguration?.name || thermostatSettings.id}

        <AddSettingPopup
          defaultThermostatSetting={newHoldSettingTemplate}
          availableActions={thermostatConfiguration?.availableActions || []}
          onSave={onAdd}
          isSaving={isSaving}
        />

        <AddSettingPopup
          defaultThermostatSetting={newScheduledSettingTemplate}
          availableActions={thermostatConfiguration?.availableActions || []}
          onSave={onAdd}
          isSaving={isSaving}
        />
      </Header>
      <Segment attached>
        {orderedSettings.map((setting, index) => {
          return (
            <ThermostatSettingBean
              thermostatSetting={setting}
              availableActions={thermostatConfiguration?.availableActions || []}
              key={`${rootStore.thermostatSettingsStore.lastUpdated.valueOf()}.${index}`}
              onRemove={onRemove}
              onSave={onSave}
              isSaving={isSaving}
            />
          );
        })}
      </Segment>
    </>
  );
};

export default observer(ThermostatSettingsComponent);
