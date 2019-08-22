import React from "react";
import { Checkbox, Form, InputOnChangeData } from "semantic-ui-react";
import { ValidationError } from "yup";

import { ThermostatConfigurationSchema, TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import EditFormModal from "./EditFormModal";
import * as EditFormTools from "./EditFormTools";

import {
  UpdateThermostatConfigurationComponent,
  ThermostatConfigurationsQuery,
} from "../generated/graphqlClient";

type ThermostatConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatConfigurationsQuery, "getThermostatConfigurations">
>;

interface Props {
  values: ThermostatConfiguration;
}

class State {
  constructor(props: Props) {
    this.values = props.values;
  }

  values: ThermostatConfiguration;
  validationError?: ValidationError;
}

class ThermostatConfigurationModal extends React.Component<Props, State> {
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
      ThermostatConfigurationSchema.Schema,
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
      <UpdateThermostatConfigurationComponent>
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
                    thermostatConfiguration: values,
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
              <Form.Group inline>
                <label>Allowed actions:</label>
                {ThermostatConfigurationSchema.Actions.map(action => (
                  <Form.Field
                    control={Checkbox}
                    label={action}
                    name="allowedActions"
                    value={action}
                    checked={this.state.values.allowedActions.includes(action)}
                    key={`allowedActions.${action}`}
                    onChange={this.handleChange}
                  />
                ))}
              </Form.Group>
              <Form.Input
                label="Heat to"
                name="setPointHeat"
                error={this.getFieldError("setPointHeat")}
                value={this.state.values.setPointHeat}
                type="number"
                min={ThermostatConfigurationSchema.SetPointRange.min}
                max={ThermostatConfigurationSchema.SetPointRange.max}
                step={1}
                onChange={this.handleChange}
              />
              <Form.Input
                label="Cool to"
                name="setPointCool"
                error={this.getFieldError("setPointCool")}
                value={this.state.values.setPointCool}
                type="number"
                min={ThermostatConfigurationSchema.SetPointRange.min}
                max={ThermostatConfigurationSchema.SetPointRange.max}
                step={1}
                onChange={this.handleChange}
              />
              <Form.Input
                label="Threshold"
                name="threshold"
                error={this.getFieldError("threshold")}
                value={this.state.values.threshold}
                type="number"
                min={ThermostatConfigurationSchema.ThresholdRange.min}
                max={ThermostatConfigurationSchema.ThresholdRange.max}
                step={0.5}
                onChange={this.handleChange}
              />
              <Form.Input
                label="Cadence"
                name="cadence"
                error={this.getFieldError("cadence")}
                value={this.state.values.cadence}
                type="number"
                min={ThermostatConfigurationSchema.CadenceRange.min}
                max={ThermostatConfigurationSchema.CadenceRange.max}
                step={10}
                onChange={this.handleChange}
              />
              <Form.Group inline>
                <label>Available actions:</label>
                {ThermostatConfigurationSchema.Actions.map(action => (
                  <Form.Field
                    control={Checkbox}
                    label={action}
                    name="availableActions"
                    value={action}
                    checked={this.state.values.availableActions.includes(action)}
                    key={`availableAction.${action}`}
                    onChange={this.handleChange}
                  />
                ))}
              </Form.Group>
            </EditFormModal>
          );
        }}
      </UpdateThermostatConfigurationComponent>
    );
  }
}

export default ThermostatConfigurationModal;
