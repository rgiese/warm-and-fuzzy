import React, { useContext } from "react";
import { Table } from "semantic-ui-react";
import { observer } from "mobx-react";

import { ThermostatSettingSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import * as GraphQL from "../generated/graphqlClient";

import StoreChecks from "./StoreChecks";
import ThermostatSettingBean from "./ThermostatSettingBean";

const ThermostatSettingsComponent: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  return (
    <StoreChecks
      requiredStores={[rootStore.thermostatConfigurationStore, rootStore.thermostatSettingsStore]}
    >
      <Table celled striped structured>
        {/* Consider making entire table collapsing */}
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Thermostat</Table.HeaderCell>
            <Table.HeaderCell>Hold</Table.HeaderCell>
            <Table.HeaderCell colSpan={2}>Schedule</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rootStore.thermostatSettingsStore.data.map(thermostatSettings => {
            const thermostatConfiguration = rootStore.thermostatConfigurationStore.findById(
              thermostatSettings.id
            );

            const holdSetting = thermostatSettings.settings.find(
              setting =>
                setting.type === GraphQL.ThermostatSettingType.Hold && setting.allowedActions.length
            );

            const scheduledSettings = thermostatSettings.settings.filter(
              setting => setting.type === GraphQL.ThermostatSettingType.Scheduled
            );

            return (
              <React.Fragment key={thermostatSettings.id}>
                <Table.Row>
                  <Table.Cell collapsing rowSpan={7} verticalAlign="top">
                    {thermostatConfiguration?.name || thermostatSettings.id}
                  </Table.Cell>
                  <Table.Cell collapsing rowSpan={7} verticalAlign="top">
                    {holdSetting && (
                      <ThermostatSettingBean
                        thermostatSetting={holdSetting}
                        availableActions={thermostatConfiguration?.availableActions || []}
                      />
                    )}
                  </Table.Cell>
                  <Table.Cell collapsing>{ThermostatSettingSchema.DaysOfWeek[0]}</Table.Cell>
                  <Table.Cell>
                    {scheduledSettings
                      .filter(setting =>
                        setting.daysOfWeek?.includes(ThermostatSettingSchema.DaysOfWeek[0])
                      )
                      .map(setting => (
                        <ThermostatSettingBean
                          thermostatSetting={setting}
                          availableActions={thermostatConfiguration?.availableActions || []}
                          key={setting.atMinutesSinceMidnight?.toString()}
                        />
                      ))}
                  </Table.Cell>
                </Table.Row>
                {ThermostatSettingSchema.DaysOfWeek.slice(1).map(dayOfWeek => (
                  <Table.Row key={dayOfWeek}>
                    <Table.Cell collapsing>{dayOfWeek}</Table.Cell>
                    <Table.Cell>
                      {scheduledSettings
                        .filter(setting => setting.daysOfWeek?.includes(dayOfWeek))
                        .map(setting => (
                          <ThermostatSettingBean
                            thermostatSetting={setting}
                            availableActions={thermostatConfiguration?.availableActions || []}
                            key={setting.atMinutesSinceMidnight?.toString()}
                          />
                        ))}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </React.Fragment>
            );
          })}
        </Table.Body>
      </Table>
    </StoreChecks>
  );
};

export default observer(ThermostatSettingsComponent);
