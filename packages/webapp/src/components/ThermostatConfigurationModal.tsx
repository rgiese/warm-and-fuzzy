import React from "react";
import {
  Accordion,
  Checkbox,
  DropdownProps,
  Form,
  Icon,
  InputOnChangeData,
} from "semantic-ui-react";
import { ValidationError } from "yup";
import moment from "moment-timezone";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import {
  RootStoreContext,
  ThermostatConfiguration,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import EditFormModal from "./EditFormModal";
import * as EditFormTools from "./EditFormTools";

interface Props {
  values: ThermostatConfiguration;
}

class State {
  constructor(props: Props) {
    this.values = props.values;
    this.showSystemSetup = false;
  }

  values: ThermostatConfiguration;
  validationError?: ValidationError;
  showSystemSetup: boolean;
}

class ThermostatConfigurationModal extends React.Component<Props, State> {
  static contextType = RootStoreContext;
  context!: React.ContextType<typeof RootStoreContext>;

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
      data as EditFormTools.OnChangeData // name="" defined for each control below
    );

    if (handleChangeResult) {
      this.setState(handleChangeResult);
    }
  };

  handleDropdownChange = async (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ): Promise<void> => {
    console.log(data);

    const handleChangeResult = await EditFormTools.handleChange(
      this.state.values,
      ThermostatConfigurationSchema.Schema,
      { ...data, type: "select" } as EditFormTools.OnChangeData // name="" defined for each control below
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
          await this.context.rootStore.thermostatConfigurationStore.updateItem(this.state.values);
        }}
        header={
          <>
            {this.props.values.name} (<code>{this.props.values.id}</code>)
          </>
        }
      >
        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="Heat to [&deg;C]"
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
            fluid
            label="Cool to [&deg;C]"
            name="setPointCool"
            error={this.getFieldError("setPointCool")}
            value={this.state.values.setPointCool}
            type="number"
            min={ThermostatConfigurationSchema.SetPointRange.min}
            max={ThermostatConfigurationSchema.SetPointRange.max}
            step={1}
            onChange={this.handleChange}
          />
        </Form.Group>

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

        <Accordion>
          <Accordion.Title
            active={this.state.showSystemSetup}
            onClick={() => this.setState({ showSystemSetup: !this.state.showSystemSetup })}
          >
            <Icon name="dropdown" />
            System setup
          </Accordion.Title>

          <Accordion.Content active={this.state.showSystemSetup}>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Name"
                name="name"
                error={this.getFieldError("name")}
                value={this.state.values.name}
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                label="Stream Name"
                name="streamName"
                error={this.getFieldError("streamName")}
                value={this.state.values.streamName}
                onChange={this.handleChange}
              />
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Threshold [&Delta;&deg;C]"
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
                fluid
                label="Cadence [sec]"
                name="cadence"
                error={this.getFieldError("cadence")}
                value={this.state.values.cadence}
                type="number"
                min={ThermostatConfigurationSchema.CadenceRange.min}
                max={ThermostatConfigurationSchema.CadenceRange.max}
                step={10}
                onChange={this.handleChange}
              />
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="External sensor ID"
                name="externalSensorId"
                error={this.getFieldError("externalSensorId")}
                value={this.state.values.externalSensorId}
                onChange={this.handleChange}
              />

              <Form.Select
                fluid
                label="Timezone"
                name="timezone"
                options={moment.tz.names().map(timezone => {
                  return { text: timezone, value: timezone };
                })}
                error={this.getFieldError("timezone")}
                value={this.state.values.timezone || ""}
                onChange={this.handleDropdownChange}
              />
            </Form.Group>

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
          </Accordion.Content>
        </Accordion>
      </EditFormModal>
    );
  }
}

export default ThermostatConfigurationModal;
