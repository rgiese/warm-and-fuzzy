import React from "react";
import { Button, Form, Icon, InputOnChangeData, Message, Modal } from "semantic-ui-react";
import { ValidationError } from "yup";

import { SensorConfigurationSchema, TypeTools } from "@grumpycorp/warm-and-fuzzy-shared";

import {
  UpdateSensorConfigurationComponent,
  SensorConfigurationsQuery,
} from "../generated/graphqlClient";

type SensorConfiguration = TypeTools.ArrayElementType<
  TypeTools.PropType<SensorConfigurationsQuery, "getSensorConfigurations">
>;

interface Props {
  sensorConfiguration: SensorConfiguration;
}

class State {
  constructor(props: Props) {
    this.isModalOpen = false;
    this.isSaving = false;
    this.sensorConfiguration = props.sensorConfiguration;
  }

  isModalOpen: boolean;
  isSaving: boolean;
  sensorConfiguration: SensorConfiguration;
  validationError?: ValidationError;
}

class SensorConfigurationModal extends React.Component<Props, State> {
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
    if (this.state.sensorConfiguration.hasOwnProperty(data.name)) {
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
      }

      const SensorConfiguration = {
        ...this.state.sensorConfiguration,
        [data.name]: value,
      } as SensorConfiguration;

      let validationError: ValidationError | undefined = undefined;

      try {
        await SensorConfigurationSchema.Schema.validate(SensorConfiguration);
      } catch (error) {
        validationError = error;
      }

      this.setState({ sensorConfiguration: SensorConfiguration, validationError });
    }
  };

  getFieldError = (field: string): any | undefined => {
    if (!this.state.sensorConfiguration.hasOwnProperty(field)) {
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
      <UpdateSensorConfigurationComponent>
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
                {this.props.sensorConfiguration.name} (
                <code>{this.props.sensorConfiguration.id}</code>)
              </Modal.Header>
              <Modal.Content>
                <Form loading={this.state.isSaving}>
                  <Form.Input
                    label="Name"
                    name="name"
                    error={this.getFieldError("name")}
                    value={this.state.sensorConfiguration.name}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Stream Name"
                    name="streamName"
                    error={this.getFieldError("streamName")}
                    value={this.state.sensorConfiguration.streamName}
                    onChange={this.handleChange}
                  />
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
                    let values = this.state.sensorConfiguration;
                    delete values.__typename;

                    await mutateFunction({
                      variables: {
                        sensorConfiguration: values,
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
      </UpdateSensorConfigurationComponent>
    );
  }
}

export default SensorConfigurationModal;
