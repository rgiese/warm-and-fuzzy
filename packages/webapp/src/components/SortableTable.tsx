import React from "react";
import { Table } from "semantic-ui-react";

class TableFieldDefinition<T extends SortableOfT, SortableOfT extends object> {
    public constructor(
      sortField: keyof SortableOfT | undefined,
      label: string,
      valueField: keyof T | undefined = sortField
    ) {
      this.sortField = sortField;
      this.valueField = valueField;
      this.label = label;
    }
  
    public sortField: keyof SortableOfT | undefined;
    public valueField: keyof T | undefined;
    public label: string;
  }
  
interface Props<T extends SortableOfT, SortableOfT extends object> {
    fields: TableFieldDefinition<T, SortableOfT>[];
    defaultSortField: keyof SortableOfT;
}

class State<T extends SortableOfT, SortableOfT extends object> {
  public constructor(props: Props<T, SortableOfT>) {
    this.sortOrder = props.defaultSortField;
    this.sortAscending = true;
  }

  sortOrder: keyof SortableOfT;
  sortAscending: boolean;
}

class SortableTable<T extends SortableOfT, SortableOfT extends object> extends React.Component<Props<T, SortableOfT>, State<T, SortableOfT>> {
  public constructor(props: Props<T, SortableOfT>) {
    super(props);
    this.state = new State<T, SortableOfT>(props);
  }

  public render(): React.ReactElement {
    return (
        <Table>
            
        </Table>
    );
  }
}