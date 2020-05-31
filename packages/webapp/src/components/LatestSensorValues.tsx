import {
  LatestSensorValue,
  Temperature,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import React, { useEffect, useState } from "react";
import SortableTable, { TableFieldDefinition } from "./SortableTable";

import StoreChecks from "./StoreChecks";
import moment from "moment";
import { observer } from "mobx-react";

type SensorValue = Omit<LatestSensorValue, "temperature"> & {
  // Injected fields
  name: string;
  lastUpdated: string;
  // Type-converted fields
  temperature: Temperature;
};

const tableDefinition: TableFieldDefinition<SensorValue>[] = [
  { field: "name", label: "Sensor" },
  { field: "lastUpdated", label: "Last updated" },
  { field: "temperature", label: "Temperature" },
];

function LatestSensorValues(): React.ReactElement {
  const rootStore = useRootStore();

  const latestSensorValuesStore = rootStore.latestSensorValuesStore;
  const sensorConfigurationStore = rootStore.sensorConfigurationStore;

  const [latestRenderTime, setLatestRenderTime] = useState(new Date());

  const refreshStores = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rootStore.latestSensorValuesStore.update();
  };

  useEffect(() => {
    //
    // Use latestRenderTime to force a list re-render
    // every so often in order to update the "Last update a few seconds ago" strings
    // relative to actual/current time.
    //
    const intervalRefreshTimeSince = setInterval(() => setLatestRenderTime(new Date()), 10 * 1000);
    const intervalRefreshStores = setInterval(() => refreshStores(), 60 * 1000);

    return function cleanup(): void {
      clearInterval(intervalRefreshTimeSince);
      clearInterval(intervalRefreshStores);
    };
  });

  // Project data
  const values = latestSensorValuesStore.data.map(
    (value): SensorValue => {
      return {
        ...value,
        // Injected fields
        name: sensorConfigurationStore.findById(value.id)?.name ?? value.id,
        lastUpdated: moment(value.deviceTime).from(latestRenderTime),
        // Type-converted fields
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
}

export default observer(LatestSensorValues);
