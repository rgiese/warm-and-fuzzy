import React from "react";
import { Table } from "semantic-ui-react";
import gql from "graphql-tag";

import { TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import {
  ThermostatConfigurationsComponent,
  ThermostatConfigurationsQuery,
} from "../generated/graphqlClient";

import ThermostatConfigurationModel from "./ThermostatConfigurationModal";

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

type SortableThermostatConfiguration = Pick<
  ThermostatConfiguration,
  "id" | "name" | "streamName" | "setPointHeat" | "setPointCool" | "threshold" | "cadence"
>;


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

class State {
  public constructor() {
    this.sortOrder = "id";
    this.sortAscending = true;
  }

  sortOrder: keyof SortableThermostatConfiguration;
  sortAscending: boolean;
}

class ThermostatConfigs extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State();
  }

  handleSort = (sortOrder: keyof SortableThermostatConfiguration) => () => {
    if (sortOrder !== this.state.sortOrder) {
      this.setState({ sortOrder, sortAscending: true });
    } else {
      this.setState({ sortAscending: !this.state.sortAscending });
    }
  };

  isSorted = (
    sortOrder: keyof SortableThermostatConfiguration
  ): "ascending" | "descending" | undefined => {
    if (sortOrder !== this.state.sortOrder) {
      return undefined;
    }

    return this.state.sortAscending ? "ascending" : "descending";
  };

  public render(): React.ReactElement {
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

          const thermostatConfigurations = data.getThermostatConfigurations.sort(
            (lhs, rhs): number => {
              const lhsKey = lhs[this.state.sortOrder];
              const rhsKey = rhs[this.state.sortOrder];

              const ascendingResult = ["id", "name", "streamName"].includes(this.state.sortOrder)
                ? (lhsKey as string).localeCompare(rhsKey as string)
                : (lhsKey as number) - (rhsKey as number);

              return this.state.sortAscending ? ascendingResult : -1 * ascendingResult;
            }
          );

          const tableDefinition: TableFieldDefinition<
            ThermostatConfiguration,
            SortableThermostatConfiguration
          >[] = [
            new TableFieldDefinition("id", "ID"),
            new TableFieldDefinition("name", "Name"),
            new TableFieldDefinition("streamName", "Stream Name"),
            new TableFieldDefinition(undefined, "Allowed actions", "allowedActions"),
            new TableFieldDefinition("setPointHeat", "Heat to"),
            new TableFieldDefinition("setPointCool", "Cool to"),
            new TableFieldDefinition("threshold", "Threshold"),
            new TableFieldDefinition("cadence", "Cadence"),
            new TableFieldDefinition(undefined, "Available actions", "availableActions"),
          ];

          return (
            <Table sortable basic="very" compact size="small">
              <Table.Header>
                <Table.Row>
                  {tableDefinition.map(
                    (fieldDefinition): React.ReactElement => {
                      return fieldDefinition.sortField !== undefined ? (
                        <Table.HeaderCell
                          onClick={this.handleSort(fieldDefinition.sortField)}
                          sorted={this.isSorted(fieldDefinition.sortField)}
                          key={fieldDefinition.label}
                        >
                          {fieldDefinition.label}
                        </Table.HeaderCell>
                      ) : (
                        <Table.HeaderCell key={fieldDefinition.label}>
                          {fieldDefinition.label}
                        </Table.HeaderCell>
                      );
                    }
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {thermostatConfigurations.map(
                  (value): React.ReactElement => {
                    return (
                      <Table.Row key={value.id}>
                        {tableDefinition.map(
                          (fieldDefinition): React.ReactElement => {
                            const valuePresenter = (v: any) => {
                              return Array.isArray(v) ? v.join(", ") : v;
                            };

                            if (fieldDefinition.sortField) {
                              return (
                                <Table.Cell key={fieldDefinition.sortField}>
                                  {valuePresenter(value[fieldDefinition.sortField])}
                                </Table.Cell>
                              );
                            } else if (fieldDefinition.valueField) {
                              return (
                                <Table.Cell key={fieldDefinition.valueField}>
                                  {valuePresenter(value[fieldDefinition.valueField])}
                                </Table.Cell>
                              );
                            } else {
                              return <></>;
                            }
                          }
                        )}
                        <Table.Cell>
                          <ThermostatConfigurationModel thermostatConfiguration={value} />
                        </Table.Cell>
                      </Table.Row>
                    );
                  }
                )}
              </Table.Body>
            </Table>
          );
        }}
      </ThermostatConfigurationsComponent>
    );
  }
}

export default ThermostatConfigs;
