import { SensorConfiguration, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";
import SortableTable, { TableFieldDefinition } from "./SortableTable";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import React from "react";
import SensorConfigurationModal from "./SensorConfigurationModal";
import StoreChecks from "./StoreChecks";
import { observer } from "mobx-react";

const tableDefinition: TableFieldDefinition<SensorConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "streamName", label: "Stream Name" },
];

function SensorConfigs(): React.ReactElement {
  const rootStore = useRootStore();

  const canEdit = rootStore.authStore.userPermissions.includes(
    Authorization.Permissions.WriteConfig
  );

  // eslint-disable-next-line react/no-multi-comp
  function fnBuildEditControl(value: SensorConfiguration): React.ReactElement {
    return <SensorConfigurationModal values={value} />;
  }

  return (
    <StoreChecks requiredStores={[rootStore.sensorConfigurationStore]}>
      <SortableTable
        data={rootStore.sensorConfigurationStore.data}
        defaultSortField="name"
        fieldDefinitions={tableDefinition}
        keyField="id"
        right={canEdit ? fnBuildEditControl : undefined}
        tableProps={{ basic: "very", compact: true, size: "small" }}
      />
    </StoreChecks>
  );
}

export default observer(SensorConfigs);
