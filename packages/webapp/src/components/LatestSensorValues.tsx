import React from "react";
import { observer } from "mobx-react";

import { RootStore, LatestSensorValue } from "../stores/stores";
import * as StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

type SensorValue = LatestSensorValue & { name: string };

const tableDefinition: TableFieldDefinition<SensorValue>[] = [
  { field: "name", label: "Sensor" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature", units: <>&deg;C</> },
];

const LatestSensorValues: React.FunctionComponent<{ rootStore: RootStore }> = ({
  rootStore,
}): React.ReactElement => {
  const latestSensorValuesStore = rootStore.latestSensorValuesStore;
  const sensorConfigurationStore = rootStore.sensorConfigurationStore;

  const storeDependencies = [latestSensorValuesStore, sensorConfigurationStore];

  if (!StoreChecks.areStoresAvailable(storeDependencies)) {
    return StoreChecks.renderStoreWorkingOrErrorComponent(storeDependencies);
  }

  // Build maps
  const sensorNames = new Map(
    sensorConfigurationStore.data.map((c): [string, string] => [c.id, c.name])
  );

  // Project data
  const values = latestSensorValuesStore.data.map(
    (value): SensorValue => {
      return { ...value, name: sensorNames.get(value.id) || value.id };
    }
  );

  return (
    <SortableTable
      tableProps={{ basic: "very", collapsing: true, compact: true, size: "small" }}
      data={values}
      fieldDefinitions={tableDefinition}
      keyField="id"
      defaultSortField="name"
    />
  );
};

export default observer(LatestSensorValues);
