import {
  LatestSensorValue,
  Temperature,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import SortableTable, { TableFieldDefinition } from "./SortableTable";

import React from "react";
import StoreChecks from "./StoreChecks";
import { observer } from "mobx-react";

type SensorValue = Omit<LatestSensorValue, "temperature"> & {
  name: string;
  temperature: Temperature;
};

const tableDefinition: TableFieldDefinition<SensorValue>[] = [
  { field: "name", label: "Sensor" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature" },
];

const LatestSensorValues: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();

  const latestSensorValuesStore = rootStore.latestSensorValuesStore;
  const sensorConfigurationStore = rootStore.sensorConfigurationStore;

  // Project data
  const values = latestSensorValuesStore.data.map(
    (value): SensorValue => {
      return {
        ...value,
        name: sensorConfigurationStore.findById(value.id)?.name ?? value.id,
        temperature: new Temperature(value.temperature),
      };
    }
  );

  return (
    <StoreChecks requiredStores={[latestSensorValuesStore, sensorConfigurationStore]}>
      <SortableTable
        data={values}
        defaultSortField="name"
        fieldDefinitions={tableDefinition}
        keyField="id"
        tableProps={{ basic: "very", collapsing: true, compact: true, size: "small" }}
      />
    </StoreChecks>
  );
};

export default observer(LatestSensorValues);
