import React, { useContext } from "react";
import { observer } from "mobx-react";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import { SensorConfiguration, RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import SensorConfigurationModal from "./SensorConfigurationModal";

const tableDefinition: TableFieldDefinition<SensorConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "streamName", label: "Stream Name" },
];

const SensorConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  const canEdit = rootStore.authStore.userPermissions.includes(
    Authorization.Permissions.WriteConfig
  );

  const fnBuildEditControl = (value: SensorConfiguration): React.ReactElement => (
    <SensorConfigurationModal values={value} />
  );

  return (
    <StoreChecks requiredStores={[rootStore.sensorConfigurationStore]}>
      <SortableTable
        tableProps={{ basic: "very", compact: true, size: "small" }}
        data={rootStore.sensorConfigurationStore.data}
        fieldDefinitions={tableDefinition}
        keyField="id"
        defaultSortField="name"
        right={canEdit ? fnBuildEditControl : undefined}
      />
    </StoreChecks>
  );
};

export default observer(SensorConfigs);
