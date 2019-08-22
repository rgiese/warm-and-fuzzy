import React from "react";
import { Button, Checkbox, Form, Icon, InputOnChangeData, Message, Modal } from "semantic-ui-react";
import { ValidationError } from "yup";

import { ThermostatConfigurationSchema, TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import {
  UpdateThermostatConfigurationComponent,
  ThermostatConfigurationsQuery,
} from "../generated/graphqlClient";

import { ThermostatAction } from "@grumpycorp/warm-and-fuzzy-shared/build/generated/graphqlTypes";

type ThermostatConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<ThermostatConfigurationsQuery, "getThermostatConfigurations">
>;

interface Props {
  thermostatConfiguration: ThermostatConfiguration;
}

class State {
  constructor(props: Props) {
    this.isModalOpen = false;
    this.isSaving = false;
    this.thermostatConfiguration = props.thermostatConfiguration;
  }

  isModalOpen: boolean;
  isSaving: boolean;
  thermostatConfiguration: ThermostatConfiguration;
  validationError?: ValidationError;
}

class ThermostatConfigurationModal extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = new State(props);
  }

  handleOpen = (): void => {
    this.setState({ isModalOpen: true });
  };

  handleClose = (): void => {
    this.setState({ isModalOpen: false });
  };

  handleChange = async (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ): Promise<void> => {
    if (this.state.thermostatConfiguration.hasOwnProperty(data.name)) {
      let value;

      switch (data.type) {
        case "text":
          value = data.value;
          break;

        case "number":
          value = parseFloat(data.value);

          if (isNaN(value)) {
            value = "";
          }

          break;

        case "checkbox":
          switch (data.name) {
            case "allowedActions":
              value = this.state.thermostatConfiguration.allowedActions;
              break;
            case "availableActions":
              value = this.state.thermostatConfiguration.availableActions;
              break;
            default:
              return;
          }

          value = value.filter(a => a !== data.value);

          if (data.checked) {
            value.push(data.value as ThermostatAction);
          }
          break;
      }

      const thermostatConfiguration = {
        ...this.state.thermostatConfiguration,
        [data.name]: value,
      } as ThermostatConfiguration;

      let validationError: ValidationError | undefined = undefined;

      try {
        await ThermostatConfigurationSchema.Schema.validate(thermostatConfiguration);
      } catch (error) {
        validationError = error;
      }

      this.setState({ thermostatConfiguration, validationError });
    }
  };

  getFieldError = (field: string): any | undefined => {
    if (!this.state.thermostatConfiguration.hasOwnProperty(field)) {
      return undefined;
    }

    if (!this.state.validationError) {
      return undefined;
    }

    if (this.state.validationError.path === field) {
      return { content: this.state.validationError.message, pointing: "below" };
    }

    return undefined;
  };

  public render(): React.ReactElement {
    return (
      <UpdateThermostatConfigurationComponent>
        {(mutateFunction, { error }): React.ReactElement => {
          return (
            <Modal
              open={this.state.isModalOpen}
              trigger={
                <Button animated="vertical" basic onClick={this.handleOpen}>
                  <Button.Content hidden>Edit</Button.Content>
                  <Button.Content visible>
                    <Icon name="pencil" />
                  </Button.Content>
                </Button>
              }
              onClose={this.handleClose}
              basic
              dimmer="inverted"
              size="small"
            >
              <Modal.Header>
                {this.props.thermostatConfiguration.name} (
                <code>{this.props.thermostatConfiguration.id}</code>)
              </Modal.Header>
              <Modal.Content>
                <Form loading={this.state.isSaving}>
                  <Form.Input
                    label="Name"
                    name="name"
                    error={this.getFieldError("name")}
                    value={this.state.thermostatConfiguration.name}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Stream Name"
                    name="streamName"
                    error={this.getFieldError("streamName")}
                    value={this.state.thermostatConfiguration.streamName}
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
                        checked={this.state.thermostatConfiguration.allowedActions.includes(action)}
                        key={`allowedActions.${action}`}
                        onChange={this.handleChange}
                      />
                    ))}
                  </Form.Group>
                  <Form.Input
                    label="Heat to"
                    name="setPointHeat"
                    error={this.getFieldError("setPointHeat")}
                    value={this.state.thermostatConfiguration.setPointHeat}
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
                    value={this.state.thermostatConfiguration.setPointCool}
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
                    value={this.state.thermostatConfiguration.threshold}
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
                    value={this.state.thermostatConfiguration.cadence}
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
                        checked={this.state.thermostatConfiguration.availableActions.includes(
                          action
                        )}
                        key={`availableAction.${action}`}
                        onChange={this.handleChange}
                      />
                    ))}
                  </Form.Group>
                  {error && (
                    <Message
                      error
                      header="Server response"
                      content={JSON.stringify(error, null, 2)}
                    />
                  )}
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button icon="cancel" content="Cancel" onClick={this.handleClose} />
                <Button
                  icon="save"
                  content={this.state.isSaving ? "Saving..." : "Save"}
                  positive
                  disabled={this.state.validationError !== undefined}
                  onClick={async (): Promise<void> => {
                    this.setState({ isSaving: true });

                    // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
                    let values = this.state.thermostatConfiguration;
                    delete values.__typename;

                    await mutateFunction({
                      variables: {
                        thermostatConfiguration: values,
                      },
                    });

                    this.setState({ isSaving: false });
                    this.handleClose();
                  }}
                />
              </Modal.Actions>
            </Modal>
          );
        }}
      </UpdateThermostatConfigurationComponent>
    );
  }
}

export default ThermostatConfigurationModal;
