import { StrictTableProps, Table } from "semantic-ui-react";

import React from "react";
import { observer } from "mobx-react";

interface TableData {
  [key: string]: string | number | Date | string[] | number[] | undefined;
}

type TableProps = Omit<StrictTableProps, "renderBodyRow" | "tableData" | "sortable">;

export interface TableFieldDefinition<T> {
  field: keyof T;
  label: string;
  units?: string | React.ReactElement;
}

interface Props<T> {
  data: T[];
  keyField: keyof T;

  fieldDefinitions: TableFieldDefinition<T>[];
  defaultSortField: keyof T;

  right?: (value: T) => React.ReactElement;

  tableProps?: TableProps;
}

class State<T> {
  public sortOrder: keyof T;
  public sortAscending: boolean;

  public constructor(props: Props<T>) {
    this.sortOrder = props.defaultSortField;
    this.sortAscending = true;
  }
}

/* The below rule doesn't seem worth investing in at this time... */
/* eslint-disable react/require-optimization */

/* Welp, it's not a function component yet due to templating, so let's allow ourselves to use setState */
/* eslint-disable react/no-set-state */

@observer // required when used with MobX store data
class SortableTable<T extends TableData> extends React.Component<Props<T>, State<T>> {
  public constructor(props: Props<T>) {
    super(props);
    this.state = new State<T>(props);
  }

  public render(): React.ReactElement {
    const sortedData = this.sortData();

    return (
      <Table sortable {...this.props.tableProps}>
        <Table.Header>
          <Table.Row>
            {this.props.fieldDefinitions.map(
              (fieldDefinition): React.ReactElement => (
                <Table.HeaderCell
                  key={fieldDefinition.label}
                  onClick={this.handleSort(fieldDefinition.field)}
                  sorted={this.isSorted(fieldDefinition.field)}
                >
                  {fieldDefinition.label}
                </Table.HeaderCell>
              )
            )}
            {this.props.right && <Table.HeaderCell />}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedData.map(
            (value): React.ReactElement => {
              return (
                <Table.Row
                  key={
                    Array.isArray(value[this.props.keyField])
                      ? undefined
                      : (value[this.props.keyField] as string | number)
                  }
                >
                  {this.props.fieldDefinitions.map(
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

                        return v;
                      };

                      return (
                        <Table.Cell key={fieldDefinition.field as string}>
                          {valuePresenter(value[fieldDefinition.field])}
                          {fieldDefinition.units && fieldDefinition.units}
                        </Table.Cell>
                      );
                    }
                  )}
                  {this.props.right && <Table.Cell>{this.props.right(value)}</Table.Cell>}
                </Table.Row>
              );
            }
          )}
        </Table.Body>
      </Table>
    );
  }

  private readonly handleSort = (sortOrder: keyof T) => (): void => {
    if (sortOrder !== this.state.sortOrder) {
      this.setState({ sortOrder, sortAscending: true });
    } else {
      this.setState(previousState => ({
        sortAscending: !previousState.sortAscending,
      }));
    }
  };

  private readonly isSorted = (sortOrder: keyof T): "ascending" | "descending" | undefined => {
    if (sortOrder !== this.state.sortOrder) {
      return undefined;
    }

    return this.state.sortAscending ? "ascending" : "descending";
  };

  private readonly compareAscending = (lhs: T, rhs: T): number => {
    const lhsKey = lhs[this.state.sortOrder];
    const rhsKey = rhs[this.state.sortOrder];

    if (typeof lhsKey !== typeof rhsKey) {
      // Caller-side TypeScript should have caught this
      throw new Error(
        `Sort key types don't match for field ${this.state.sortOrder.toString()}: ${lhsKey?.toString()} / ${rhsKey?.toString()}`
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

    if (Array.isArray(lhsKey) && Array.isArray(rhsKey)) {
      return lhsKey.toString().localeCompare(rhsKey.toString());
    }

    // Caller-side TypeScript should have caught this
    throw new Error(`Unsupported type for field ${this.state.sortOrder.toString()}`);
  };

  private readonly sortData = (): T[] => {
    // .slice(): Duplicate data so we don't mutate the passed-in object
    return this.props.data.slice().sort((lhs, rhs): number => {
      const ascendingResult = this.compareAscending(lhs, rhs);
      return this.state.sortAscending ? ascendingResult : -1 * ascendingResult;
    });
  };
}

export default SortableTable;
