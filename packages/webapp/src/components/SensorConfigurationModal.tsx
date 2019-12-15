import React from "react";
import { Form, InputOnChangeData } from "semantic-ui-react";
import { ValidationError } from "yup";

import { SensorConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import { SensorConfiguration, SensorConfigurationStore } from "../stores/stores";

import EditFormModal from "./EditFormModal";
import * as EditFormTools from "./EditFormTools";

interface Props {
  values: SensorConfiguration;
  store: SensorConfigurationStore;
}

class State {
  constructor(props: Props) {
    this.values = props.values;
  }

  values: SensorConfiguration;
  validationError?: ValidationError;
}

class SensorConfigurationModal extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State(props);
  }

  handleChange = async (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ): Promise<void> => {
    const handleChangeResult = await EditFormTools.handleChange(
      this.state.values,
      SensorConfigurationSchema.Schema,
      data
    );

    if (handleChangeResult) {
      this.setState(handleChangeResult);
    }
  };

  getFieldError = (field: string): any | undefined => {
    return EditFormTools.getFieldError(this.state, field);
  };

  public render(): React.ReactElement {
    return (
      <EditFormModal
        canSave={this.state.validationError !== undefined}
        onSave={async (): Promise<void> => {
          await this.props.store.updateItem(this.state.values);
        }}
        header={
          <>
            {this.props.values.name} (<code>{this.props.values.id}</code>)
          </>
        }
      >
        <Form.Input
          label="Name"
          name="name"
          error={this.getFieldError("name")}
          value={this.state.values.name}
          onChange={this.handleChange}
        />
        <Form.Input
          label="Stream Name"
          name="streamName"
          error={this.getFieldError("streamName")}
          value={this.state.values.streamName}
          onChange={this.handleChange}
        />
      </EditFormModal>
    );
  }
}

export default SensorConfigurationModal;
