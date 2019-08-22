import React from "react";
import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import SortableTable, { TableFieldDefinition } from "./SortableTable";

import {
  SensorConfigurationsComponent,
  SensorConfigurationsQuery,
} from "../generated/graphqlClient";

import SensorConfigurationModal from "./SensorConfigurationModal";

gql`
  fragment SensorConfigurationFields on SensorConfiguration {
    id
    name
    streamName
  }

  query SensorConfigurations {
    getSensorConfigurations {
      ...SensorConfigurationFields
    }
  }

  mutation UpdateSensorConfiguration($sensorConfiguration: SensorConfigurationUpdateInput!) {
    updateSensorConfiguration(sensorConfiguration: $sensorConfiguration) {
      ...SensorConfigurationFields
    }
  }
`;

type SensorConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<SensorConfigurationsQuery, "getSensorConfigurations">
>;

const tableDefinition: TableFieldDefinition<SensorConfiguration>[] = [
  { field: "id", label: "ID" },
  { field: "name", label: "Name" },
  { field: "streamName", label: "Stream Name" },
];

const SensorConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <SensorConfigurationsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getSensorConfigurations) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        return (
          <SortableTable
            tableProps={{ basic: "very", compact: true, size: "small" }}
            data={data.getSensorConfigurations}
            fieldDefinitions={tableDefinition}
            keyField="id"
            defaultSortField="name"
            right={value => <SensorConfigurationModal sensorConfiguration={value} />}
          />
        );
      }}
    </SensorConfigurationsComponent>
  );
};

export default SensorConfigs;
