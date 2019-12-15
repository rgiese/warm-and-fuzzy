import React from "react";
import { observer } from "mobx-react";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import { GlobalAuth } from "../services/Auth";

import { RootStore, SensorConfiguration } from "../stores/stores";
import * as StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import SensorConfigurationModal from "./SensorConfigurationModal";

const tableDefinition: TableFieldDefinition<SensorConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "streamName", label: "Stream Name" },
];

const SensorConfigs: React.FunctionComponent<{ rootStore: RootStore }> = ({
  rootStore,
}): React.ReactElement => {
  const storeDependencies = [rootStore.sensorConfigurationStore];

  if (!StoreChecks.areStoresAvailable(storeDependencies)) {
    return StoreChecks.renderStoreWorkingOrErrorComponent(storeDependencies);
  }

  const canEdit = GlobalAuth.Permissions.includes(Authorization.Permissions.WriteConfig);

  const fnBuildEditControl = (value: SensorConfiguration): React.ReactElement => (
    <SensorConfigurationModal values={value} store={rootStore.sensorConfigurationStore} />
  );

  return (
    <SortableTable
      tableProps={{ basic: "very", compact: true, size: "small" }}
      data={rootStore.sensorConfigurationStore.data}
      fieldDefinitions={tableDefinition}
      keyField="id"
      defaultSortField="name"
      right={canEdit ? fnBuildEditControl : undefined}
    />
  );
};

export default observer(SensorConfigs);
