import * as GraphQL from "../generated/graphqlClient";

import {
  LatestThermostatValue,
  Temperature,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import React, { useEffect, useState } from "react";
import SortableTable, { TableFieldDefinition } from "./SortableTable";

import StoreChecks from "./StoreChecks";
import moment from "moment";
import { observer } from "mobx-react";

type ThermostatValue = Omit<
  LatestThermostatValue,
  "temperature" | "setPointHeat" | "setPointCool"
> & {
  // Injected fields
  name: string;
  lastUpdated: string;
  // Type-converted fields
  temperature: Temperature;
  setPointHeat?: Temperature;
  setPointCool?: Temperature;
};

const tableDefinition: TableFieldDefinition<ThermostatValue>[] = [
  { field: "name", label: "Thermostat" },
  { field: "lastUpdated", label: "Last updated" },
  { field: "temperature", label: "Temperature" },
  { field: "humidity", label: "Humidity", units: "%" },
  { field: "setPointHeat", label: "Heat to" },
  { field: "setPointCool", label: "Cool to" },
  { field: "currentActions", label: "Actions" },
];

const LatestThermostatValues: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();

  const latestThermostatValuesStore = rootStore.latestThermostatValuesStore;
  const thermostatConfigurationStore = rootStore.thermostatConfigurationStore;

  const [latestRenderTime, setLatestRenderTime] = useState(new Date());

  const refreshStores = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rootStore.latestThermostatValuesStore.update();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rootStore.thermostatSettingsStore.update();
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
  const values = latestThermostatValuesStore.data.map(
    (value): ThermostatValue => {
      return {
        ...value,
        // Injected fields
        name: thermostatConfigurationStore.findById(value.id)?.name ?? value.id,
        lastUpdated: moment(value.deviceTime).from(latestRenderTime),
        // Type-converted fields
        temperature: new Temperature(value.temperature),
        setPointHeat: value.allowedActions.includes(GraphQL.ThermostatAction.Heat)
          ? new Temperature(value.setPointHeat)
          : undefined,
        setPointCool: value.allowedActions.includes(GraphQL.ThermostatAction.Cool)
          ? new Temperature(value.setPointCool)
          : undefined,
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
