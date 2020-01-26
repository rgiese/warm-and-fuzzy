import SortableTable, { TableFieldDefinition } from "./SortableTable";
import { ThermostatConfiguration, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";
import React from "react";
import StoreChecks from "./StoreChecks";
import ThermostatConfigurationModal from "./ThermostatConfigurationModal";
import { observer } from "mobx-react";

//
// Note: We only allow editing the Threshold in Celsius since Celsius is our base unit of measurement.
//       If we add a display value field here, we'll have to un-cast it when we save an edited value
//       and that's just more trouble and complexity than it's worth.
//

const tableDefinition: TableFieldDefinition<ThermostatConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "externalSensorId", label: "External sensor" },
  { field: "timezone", label: "Timezone" },
  { field: "streamName", label: "Stream Name" },
  { field: "threshold", label: "Threshold", units: "\u00B0C" },
  { field: "cadence", label: "Cadence", units: "sec" },
  { field: "availableActions", label: "Available actions" },
];

const ThermostatConfigs: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();

  const canEdit = rootStore.authStore.userPermissions.includes(
    Authorization.Permissions.WriteConfig
  );

  // eslint-disable-next-line react/no-multi-comp
  const fnBuildEditControl = (value: ThermostatConfiguration): React.ReactElement => (
    <ThermostatConfigurationModal values={value} />
  );

  return (
    <StoreChecks requiredStores={[rootStore.thermostatConfigurationStore]}>
      <SortableTable
        data={rootStore.thermostatConfigurationStore.data}
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
