import React from "react";
import gql from "graphql-tag";

import { Authorization, TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";
import { GlobalAuth } from "../services/Auth";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import {
  ThermostatConfigurationsComponent,
  ThermostatConfigurationsQuery,
} from "../generated/graphqlClient";

import ThermostatConfigurationModal from "./ThermostatConfigurationModal";

gql`
  fragment ThermostatConfigurationFields on ThermostatConfiguration {
    id
    name
    streamName
    availableActions
    allowedActions
    setPointHeat
    setPointCool
    threshold
    cadence
  }

  query ThermostatConfigurations {
    getThermostatConfigurations {
      ...ThermostatConfigurationFields
    }
  }

  mutation UpdateThermostatConfiguration(
    $thermostatConfiguration: ThermostatConfigurationUpdateInput!
  ) {
    updateThermostatConfiguration(thermostatConfiguration: $thermostatConfiguration) {
      ...ThermostatConfigurationFields
    }
  }
`;

type ThermostatConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatConfigurationsQuery, "getThermostatConfigurations">
>;

const tableDefinition: TableFieldDefinition<ThermostatConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "streamName", label: "Stream Name" },
  { field: "allowedActions", label: "Allowed actions" },
  { field: "setPointHeat", label: "Heat to" },
  { field: "setPointCool", label: "Cool to" },
  { field: "threshold", label: "Threshold" },
  { field: "cadence", label: "Cadence" },
  { field: "availableActions", label: "Available actions" },
];

const ThermostatConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <ThermostatConfigurationsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getThermostatConfigurations) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        const canEdit = GlobalAuth.Permissions.includes(Authorization.Permissions.WriteConfig);
        const fnBuildEditControl = (value: ThermostatConfiguration): React.ReactElement => (
          <ThermostatConfigurationModal values={value} />
        );

        return (
          <SortableTable
            tableProps={{ basic: "very", compact: true, size: "small" }}
            data={data.getThermostatConfigurations}
            fieldDefinitions={tableDefinition}
            keyField="id"
            defaultSortField="name"
            right={canEdit ? fnBuildEditControl : undefined}
          />
        );
      }}
    </ThermostatConfigurationsComponent>
  );
};

export default ThermostatConfigs;
