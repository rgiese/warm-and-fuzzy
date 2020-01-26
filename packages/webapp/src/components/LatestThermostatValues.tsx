import {
  LatestThermostatValue,
  Temperature,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import SortableTable, { TableFieldDefinition } from "./SortableTable";

import React from "react";
import StoreChecks from "./StoreChecks";
import { observer } from "mobx-react";

type ThermostatValue = Omit<LatestThermostatValue, "temperature"> & {
  name: string;
  temperature: Temperature;
};

const tableDefinition: TableFieldDefinition<ThermostatValue>[] = [
  { field: "name", label: "Thermostat" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature" },
  { field: "humidity", label: "Humidity", units: "%" },
  { field: "currentActions", label: "Actions" },
];

const LatestThermostatValues: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();

  const latestThermostatValuesStore = rootStore.latestThermostatValuesStore;
  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

  // Project data
  const values = latestThermostatValuesStore.data.map(
    (value): ThermostatValue => {
      return {
        ...value,
        name: thermostatConfigurationStore.findById(value.id)?.name ?? value.id,
        temperature: new Temperature(value.temperature),
      };
    }
  );

  return (
    <StoreChecks requiredStores={[latestThermostatValuesStore, thermostatConfigurationStore]}>
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

export default observer(LatestThermostatValues);
