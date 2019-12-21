import React, { useContext } from "react";
import { observer } from "mobx-react";

import { LatestSensorValue } from "@grumpycorp/warm-and-fuzzy-shared-client";

import RootStoreContext from "../stores/RootStoreContext";
import * as StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

type SensorValue = LatestSensorValue & { name: string };

const tableDefinition: TableFieldDefinition<SensorValue>[] = [
  { field: "name", label: "Sensor" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature", units: <>&deg;C</> },
];

const LatestSensorValues: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  const latestSensorValuesStore = rootStore.latestSensorValuesStore;
  const sensorConfigurationStore = rootStore.sensorConfigurationStore;

  const storeDependencies = [latestSensorValuesStore, sensorConfigurationStore];

  if (!StoreChecks.areStoresAvailable(storeDependencies)) {
    return StoreChecks.renderStoreWorkingOrErrorComponent(storeDependencies);
  }

  // Project data
  const values = latestSensorValuesStore.data.map(
    (value): SensorValue => {
      return { ...value, name: sensorConfigurationStore.findById(value.id)?.name || value.id };
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
