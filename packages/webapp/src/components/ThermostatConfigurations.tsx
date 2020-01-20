import React from "react";
import { observer } from "mobx-react";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatConfiguration, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import ThermostatConfigurationModal from "./ThermostatConfigurationModal";

const tableDefinition: TableFieldDefinition<ThermostatConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "externalSensorId", label: "External sensor" },
  { field: "timezone", label: "Timezone" },
  { field: "streamName", label: "Stream Name" },
  { field: "threshold", label: "Threshold", units: <>&Delta;&deg;C</> },
  { field: "cadence", label: "Cadence", units: "sec" },
  { field: "availableActions", label: "Available actions" },
];

const ThermostatConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useRootStore();

  const canEdit = rootStore.authStore.userPermissions.includes(
    Authorization.Permissions.WriteConfig
  );

  const fnBuildEditControl = (value: ThermostatConfiguration): React.ReactElement => (
    <ThermostatConfigurationModal values={value} />
  );

  return (
    <StoreChecks requiredStores={[rootStore.thermostatConfigurationStore]}>
      <SortableTable
        tableProps={{ basic: "very", compact: true, size: "small" }}
        data={rootStore.thermostatConfigurationStore.data}
        fieldDefinitions={tableDefinition}
        keyField="id"
        defaultSortField="name"
        right={canEdit ? fnBuildEditControl : undefined}
      />
    </StoreChecks>
  );
};

export default observer(ThermostatConfigs);
