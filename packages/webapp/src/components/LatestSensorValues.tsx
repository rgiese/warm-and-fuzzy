import React from "react";
import { observer } from "mobx-react";

import { LatestSensorValue, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

type SensorValue = LatestSensorValue & { name: string };

const tableDefinition: TableFieldDefinition<SensorValue>[] = [
  { field: "name", label: "Sensor" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature", units: <>&deg;C</> },
];

const LatestSensorValues: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useRootStore();

  const latestSensorValuesStore = rootStore.latestSensorValuesStore;
  const sensorConfigurationStore = rootStore.sensorConfigurationStore;

  // Project data
  const values = latestSensorValuesStore.data.map(
    (value): SensorValue => {
      return { ...value, name: sensorConfigurationStore.findById(value.id)?.name || value.id };
    }
  );

  return (
    <StoreChecks requiredStores={[latestSensorValuesStore, sensorConfigurationStore]}>
      <SortableTable
        tableProps={{ basic: "very", collapsing: true, compact: true, size: "small" }}
        data={values}
        fieldDefinitions={tableDefinition}
        keyField="id"
        defaultSortField="name"
      />
    </StoreChecks>
  );
};

export default observer(LatestSensorValues);
