import React from "react";
import { observer } from "mobx-react";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import { RootStore, LatestThermostatValuesStore } from "../stores/stores";
import * as StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

type ThermostatValue = TypeTools.ArrayElementType<
  TypeTools.PropType<LatestThermostatValuesStore, "data">
> & { name: string };

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

  // Build maps
  const thermostatNames = new Map(
    thermostatConfigurationStore.data.map((c): [string, string] => [c.id, c.name])
  );

  // Project data
  const values = latestThermostatValuesStore.data.map(
    (value): ThermostatValue => {
      return { ...value, name: thermostatNames.get(value.id) || value.id };
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
