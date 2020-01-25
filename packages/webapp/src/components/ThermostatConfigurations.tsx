import {
  RelativeTemperature,
  ThermostatConfiguration,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import SortableTable, { TableFieldDefinition } from "./SortableTable";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import React from "react";
import StoreChecks from "./StoreChecks";
import ThermostatConfigurationModal from "./ThermostatConfigurationModal";
import { observer } from "mobx-react";

type TypedThermostatConfiguration = ThermostatConfiguration & {
  typedThreshold: RelativeTemperature;
};

const tableDefinition: TableFieldDefinition<TypedThermostatConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "externalSensorId", label: "External sensor" },
  { field: "timezone", label: "Timezone" },
  { field: "streamName", label: "Stream Name" },
  { field: "typedThreshold", label: "Threshold" },
  { field: "cadence", label: "Cadence", units: "sec" },
  { field: "availableActions", label: "Available actions" },
];

const ThermostatConfigs: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();

  const canEdit = rootStore.authStore.userPermissions.includes(
    Authorization.Permissions.WriteConfig
  );

  // Project data
  const data = rootStore.thermostatConfigurationStore.data.map(
    (value): TypedThermostatConfiguration => {
      return {
        ...value,
        typedThreshold: new RelativeTemperature(value.threshold),
      };
    }
  );

  // eslint-disable-next-line react/no-multi-comp
  const fnBuildEditControl = (value: ThermostatConfiguration): React.ReactElement => (
    <ThermostatConfigurationModal values={value} />
  );

  return (
    <StoreChecks requiredStores={[rootStore.thermostatConfigurationStore]}>
      <SortableTable
        data={data}
        defaultSortField="name"
        fieldDefinitions={tableDefinition}
        keyField="id"
        right={canEdit ? fnBuildEditControl : undefined}
        tableProps={{ basic: "very", compact: true, size: "small" }}
      />
    </StoreChecks>
  );
};

export default observer(ThermostatConfigs);
