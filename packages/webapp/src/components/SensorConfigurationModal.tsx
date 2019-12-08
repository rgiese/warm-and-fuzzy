import React from "react";
import { Form, InputOnChangeData } from "semantic-ui-react";
import { ValidationError } from "yup";

import { SensorConfigurationSchema, TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import EditFormModal from "./EditFormModal";
import * as EditFormTools from "./EditFormTools";

import {
  UpdateSensorConfigurationComponent,
  SensorConfigurationsQuery,
} from "../generated/graphqlClient";

type SensorConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<SensorConfigurationsQuery, "getSensorConfigurations">
>;

interface Props {
  values: SensorConfiguration;
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
      <UpdateSensorConfigurationComponent>
        {(mutateFunction, { error }): React.ReactElement => {
          return (
            <EditFormModal
              canSave={this.state.validationError !== undefined}
              onSave={async (): Promise<void> => {
                // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
                let values = this.state.values;
                delete values.__typename;

                await mutateFunction({
                  variables: {
                    sensorConfiguration: values,
                  },
                });
              }}
              header={
                <>
                  {this.props.values.name} (<code>{this.props.values.id}</code>)
                </>
              }
              error={error ? JSON.stringify(error, null, 2) : undefined}
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
        }}
      </UpdateSensorConfigurationComponent>
    );
  }
}

export default SensorConfigurationModal;
