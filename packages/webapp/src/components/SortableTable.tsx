import React, { useState } from "react";
import {
  RelativeTemperature,
  Temperature,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import { StrictTableProps, Table } from "semantic-ui-react";

import { useObserver } from "mobx-react";

//
// To add support for new custom types:
// - Add type to TableData type enumeration
// - Add comparison logic for type to compareAscending below
// - Add presentatic logic for type to valuePresenter below
//

interface TableData {
  [key: string]:
    | string
    | number
    | Date
    | Temperature
    | RelativeTemperature
    | string[]
    | number[]
    | undefined;
}

type TableProps = Omit<StrictTableProps, "renderBodyRow" | "tableData" | "sortable">;

export interface TableFieldDefinition<T> {
  field: keyof T;
  label: string;
  units?: string | React.ReactElement;
}

//
// Implements what we need from the React.FunctionComponent contract without referring to it directly
// since we can't forward our generics otherwise.
//

const SortableTable = <T extends TableData>({
  data,
  keyField,
  fieldDefinitions,
  defaultSortField,
  right,
  tableProps,
}: {
  data: T[];
  keyField: keyof T;

  fieldDefinitions: TableFieldDefinition<T>[];
  defaultSortField: keyof T;

  right?: (value: T) => React.ReactElement;

  tableProps?: TableProps;
}): React.ReactElement => {
  const [sortOrder, setSortOrder] = useState<keyof T>(defaultSortField);
  const [sortAscending, setSortAscending] = useState(true);

  const rootStore = useRootStore();

  //
  // Helpers for managing sort order
  //

  const handleSortByField = (field: keyof T) => (): void => {
    if (field !== sortOrder) {
      setSortOrder(field);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  };

  const isSortedByField = (field: keyof T): "ascending" | "descending" | undefined => {
    if (field !== sortOrder) {
      return undefined;
    }

    return sortAscending ? "ascending" : "descending";
  };

  //
  // Sort data
  //

  const compareAscending = (lhs: T, rhs: T): number => {
    const lhsKey = lhs[sortOrder];
    const rhsKey = rhs[sortOrder];

    if (typeof lhsKey !== typeof rhsKey) {
      // Caller-side TypeScript should have caught this
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Sort key types don't match for field ${sortOrder.toString()}: ${lhsKey} / ${rhsKey}`
      );
    }

    if (typeof lhsKey === "string" && typeof rhsKey === "string") {
      return lhsKey.localeCompare(rhsKey);
    }

    if (typeof lhsKey === "number" && typeof rhsKey === "number") {
      return lhsKey - rhsKey;
    }

    if (lhsKey instanceof Date && rhsKey instanceof Date) {
      return lhsKey.getTime() - rhsKey.getTime();
    }

    if (lhsKey instanceof Temperature && rhsKey instanceof Temperature) {
      return lhsKey.valueInCelsius - rhsKey.valueInCelsius;
    }

    if (lhsKey instanceof RelativeTemperature && rhsKey instanceof RelativeTemperature) {
      return lhsKey.valueInCelsius - rhsKey.valueInCelsius;
    }

    if (Array.isArray(lhsKey) && Array.isArray(rhsKey)) {
      return lhsKey.toString().localeCompare(rhsKey.toString());
    }

    // Caller-side TypeScript should have caught this
    throw new Error(`Unsupported type for field ${sortOrder.toString()}`);
  };

  const sortedData =
    // .slice(): Duplicate data so we don't mutate the passed-in object
    data.slice().sort((lhs, rhs): number => {
      const ascendingResult = compareAscending(lhs, rhs);
      return sortAscending ? ascendingResult : -1 * ascendingResult;
    });

  return useObserver(() => (
    <Table sortable {...tableProps}>
      <Table.Header>
        <Table.Row>
          {fieldDefinitions.map(
            (fieldDefinition): React.ReactElement => (
              <Table.HeaderCell
                key={fieldDefinition.label}
                onClick={handleSortByField(fieldDefinition.field)}
                sorted={isSortedByField(fieldDefinition.field)}
              >
                {fieldDefinition.label}
              </Table.HeaderCell>
            )
          )}
          {right && <Table.HeaderCell />}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map(
          (value): React.ReactElement => {
            return (
              <Table.Row
                key={
                  Array.isArray(value[keyField]) ? undefined : (value[keyField] as string | number)
                }
              >
                {fieldDefinitions.map(
                  (fieldDefinition): React.ReactElement => {
                    // `v` is intentionally typed as `any` -> tell eslint to go away
                    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                    const valuePresenter = (v: any): any => {
                      if (Array.isArray(v)) {
                        return v.join(", ");
                      }

                      if (v instanceof Date) {
                        return v.toLocaleString();
                      }

                      if (v instanceof Temperature) {
                        return v.toString(rootStore.userPreferencesStore.userPreferences);
                      }

                      if (v instanceof RelativeTemperature) {
                        return v.toString(rootStore.userPreferencesStore.userPreferences);
                      }

                      return v;
                    };

                    return (
                      <Table.Cell key={fieldDefinition.field as string}>
                        {valuePresenter(value[fieldDefinition.field])}
                        {fieldDefinition.units}
                      </Table.Cell>
                    );
                  }
                )}
                {right && <Table.Cell>{right(value)}</Table.Cell>}
              </Table.Row>
            );
          }
        )}
      </Table.Body>
    </Table>
  ));
};

export default SortableTable;
