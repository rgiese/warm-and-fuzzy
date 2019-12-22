import React, { useContext } from "react";
import { observer } from "mobx-react";

import { LatestThermostatValue, RootStoreContext } from "@grumpycorp/warm-and-fuzzy-shared-client";

import StoreChecks from "./StoreChecks";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

type ThermostatValue = LatestThermostatValue & { name: string };

const tableDefinition: TableFieldDefinition<ThermostatValue>[] = [
  { field: "name", label: "Thermostat" },
  { field: "deviceTime", label: "Time" },
  { field: "temperature", label: "Temperature", units: <>&deg;C</> },
  { field: "humidity", label: "Humidity", units: "%" },
  { field: "currentActions", label: "Actions" },
];

const LatestThermostatValues: React.FunctionComponent<{}> = (): React.ReactElement => {
  const rootStore = useContext(RootStoreContext).rootStore;

  const latestThermostatValuesStore = rootStore.latestThermostatValuesStore;
  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

  // Project data
  const values = latestThermostatValuesStore.data.map(
    (value): ThermostatValue => {
      return { ...value, name: thermostatConfigurationStore.findById(value.id)?.name || value.id };
    }
  );

  return (
    <StoreChecks requiredStores={[latestThermostatValuesStore, thermostatConfigurationStore]}>
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

export default observer(LatestThermostatValues);
