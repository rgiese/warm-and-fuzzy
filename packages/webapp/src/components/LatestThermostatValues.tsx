import React from "react";
import { observer } from "mobx-react";

import { RootStore, LatestThermostatValue } from "../stores/stores";
import * as StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

type ThermostatValue = LatestThermostatValue & { name: string };

const tableDefinition: TableFieldDefinition<ThermostatValue>[] = [
  { field: "name", label: "Thermostat" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature", units: <>&deg;C</> },
  { field: "humidity", label: "Humidity", units: "%" },
  { field: "currentActions", label: "Actions" },
];

const LatestThermostatValues: React.FunctionComponent<{ rootStore: RootStore }> = ({
  rootStore,
}): React.ReactElement => {
  const latestThermostatValuesStore = rootStore.latestThermostatValuesStore;
  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

  const storeDependencies = [latestThermostatValuesStore, thermostatConfigurationStore];

  if (!StoreChecks.areStoresAvailable(storeDependencies)) {
    return StoreChecks.renderStoreWorkingOrErrorComponent(storeDependencies);
  }

  // Project data
  const values = latestThermostatValuesStore.data.map(
    (value): ThermostatValue => {
      return { ...value, name: thermostatConfigurationStore.findById(value.id)?.name || value.id };
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

export default observer(LatestThermostatValues);
