import React, { useContext, useState } from "react";
import { Header, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";

import cloneDeep from "clone-deep";

import { RootStoreContext, ThermostatSettings } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../generated/graphqlClient";

import StoreChecks from "./StoreChecks";
import ThermostatSettingBean, { IndexedThermostatSetting } from "./ThermostatSettingBean";

const ThermostatSettingsComponent: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <StoreChecks
      requiredStores={[rootStore.thermostatConfigurationStore, rootStore.thermostatSettingsStore]}
    >
      {rootStore.thermostatSettingsStore.data.map(thermostatSettings => {
        const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
          thermostatSettings.id
        );

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

        const onSave = async (
          updatedThermostatSetting: IndexedThermostatSetting
        ): Promise<void> => {
          setIsSaving(true);

          // Create local copy of settings array to update
          const mutatedSettingsArray = localSettingsArray.slice();

          // Swap in changed element
          mutatedSettingsArray[updatedThermostatSetting.index] = updatedThermostatSetting;

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

        return (
          <React.Fragment key={thermostatSettings.id}>
            <Header as="h3" attached="top">
              {thermostatConfiguration?.name || thermostatSettings.id}
            </Header>
            <Segment attached>
              {orderedSettings.map((setting, index) => {
                return (
                  <ThermostatSettingBean
                    thermostatSetting={setting}
                    availableActions={thermostatConfiguration?.availableActions || []}
                    key={index}
                    onSave={onSave}
                    isSaving={isSaving}
                  />
                );
              })}
            </Segment>
          </React.Fragment>
        );
      })}
    </StoreChecks>
  );
};

export default observer(ThermostatSettingsComponent);
