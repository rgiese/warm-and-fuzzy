import React from "react";
import { Table, StrictTableProps } from "semantic-ui-react";
import { observer } from "mobx-react";

interface TableData {
  [key: string]: string | number | Date | Array<string> | Array<number> | undefined;
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
  public constructor(props: Props<T>) {
    this.sortOrder = props.defaultSortField;
    this.sortAscending = true;
  }

  sortOrder: keyof T;
  sortAscending: boolean;
}

@observer // required when used with MobX store data
class SortableTable<T extends TableData> extends React.Component<Props<T>, State<T>> {
  public constructor(props: Props<T>) {
    super(props);
    this.state = new State<T>(props);
  }

  handleSort = (sortOrder: keyof T) => () => {
    if (sortOrder !== this.state.sortOrder) {
      this.setState({ sortOrder, sortAscending: true });
    } else {
      this.setState({ sortAscending: !this.state.sortAscending });
    }
  };

  isSorted = (sortOrder: keyof T): "ascending" | "descending" | undefined => {
    if (sortOrder !== this.state.sortOrder) {
      return undefined;
    }

    return this.state.sortAscending ? "ascending" : "descending";
  };

  compareAscending = (lhs: T, rhs: T): number => {
    const lhsKey = lhs[this.state.sortOrder];
    const rhsKey = rhs[this.state.sortOrder];

    if (typeof lhsKey !== typeof rhsKey) {
      // Caller-side TypeScript should have caught this
      throw new Error(
        `Sort key types don't match for field ${this.state.sortOrder}: ${lhsKey} / ${rhsKey}`
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
    throw new Error(`Unsupported type for field ${this.state.sortOrder}`);
  };

  sortData = (): T[] => {
    return this.props.data.sort((lhs, rhs): number => {
      const ascendingResult = this.compareAscending(lhs, rhs);
      return this.state.sortAscending ? ascendingResult : -1 * ascendingResult;
    });
  };

  public render(): React.ReactElement {
    const sortedData = this.sortData();

    return (
      <Table sortable {...this.props.tableProps}>
        <Table.Header>
          <Table.Row>
            {this.props.fieldDefinitions.map(
              (fieldDefinition): React.ReactElement => (
                <Table.HeaderCell
                  onClick={this.handleSort(fieldDefinition.field)}
                  sorted={this.isSorted(fieldDefinition.field)}
                  key={fieldDefinition.label}
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
                      const valuePresenter = (v: any) => {
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
                          {fieldDefinition.units && (
                            <>
                              {` `}
                              {fieldDefinition.units}
                            </>
                          )}
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
}

export default SortableTable;
