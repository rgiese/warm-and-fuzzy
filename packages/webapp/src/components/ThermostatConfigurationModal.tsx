import React, { useContext, useState } from "react";
import { Checkbox, DropdownProps, Form, InputOnChangeData } from "semantic-ui-react";
import { ValidationError } from "yup";
import moment from "moment-timezone";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import {
  RootStoreContext,
  ThermostatConfiguration,
} from "@grumpycorp/warm-and-fuzzy-shared-client";

import EditFormModal from "./EditFormModal";
import * as EditFormTools from "./EditFormTools";

const ThermostatConfigurationModal: React.FunctionComponent<{
  values: ThermostatConfiguration;
}> = ({ values }): React.ReactElement => {
  const [mutableValues, setMutableValues] = useState(values);
  const [validationError, setValidationError] = useState<ValidationError | undefined>(undefined);

  const rootStore = useContext(RootStoreContext).rootStore;

  const handleChange = async (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ): Promise<void> => {
    const handleChangeResult = await EditFormTools.handleChange(
      mutableValues,
      ThermostatConfigurationSchema.Schema,
      data as EditFormTools.OnChangeData // name="" defined for each control below
    );

    if (handleChangeResult) {
      setMutableValues(handleChangeResult.values);
      setValidationError(handleChangeResult.validationError);
    }
  };

  const handleDropdownChange = async (
    _event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ): Promise<void> => {
    const handleChangeResult = await EditFormTools.handleChange(
      mutableValues,
      ThermostatConfigurationSchema.Schema,
      { ...data, type: "select" } as EditFormTools.OnChangeData // name="" defined for each control below
    );

    if (handleChangeResult) {
      setMutableValues(handleChangeResult.values);
      setValidationError(handleChangeResult.validationError);
    }
  };

  const getFieldError = (field: string): any | undefined => {
    return EditFormTools.getFieldError({ values: mutableValues, validationError }, field);
  };

  return (
    <EditFormModal
      canSave={validationError !== undefined}
      onSave={async (): Promise<void> => {
        await rootStore.thermostatConfigurationStore.updateItem(mutableValues);
      }}
      header={
        <>
          {values.name} (<code>{values.id}</code>)
        </>
      }
    >
      <Form.Group widths="equal">
        <Form.Input
          fluid
          label="Name"
          name="name"
          error={getFieldError("name")}
          value={mutableValues.name}
          onChange={handleChange}
        />

        <Form.Input
          fluid
          label="Stream Name"
          name="streamName"
          error={getFieldError("streamName")}
          value={mutableValues.streamName}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Input
          fluid
          label="Threshold [&Delta;&deg;C]"
          name="threshold"
          error={getFieldError("threshold")}
          value={mutableValues.threshold}
          type="number"
          min={ThermostatConfigurationSchema.ThresholdRange.min}
          max={ThermostatConfigurationSchema.ThresholdRange.max}
          step={0.5}
          onChange={handleChange}
        />

        <Form.Input
          fluid
          label="Cadence [sec]"
          name="cadence"
          error={getFieldError("cadence")}
          value={mutableValues.cadence}
          type="number"
          min={ThermostatConfigurationSchema.CadenceRange.min}
          max={ThermostatConfigurationSchema.CadenceRange.max}
          step={10}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Input
          fluid
          label="External sensor ID"
          name="externalSensorId"
          error={getFieldError("externalSensorId")}
          value={mutableValues.externalSensorId}
          onChange={handleChange}
        />

        <Form.Select
          fluid
          label="Timezone"
          name="timezone"
          options={moment.tz.names().map(timezone => {
            return { text: timezone, value: timezone };
          })}
          error={getFieldError("timezone")}
          value={mutableValues.timezone || ""}
          onChange={handleDropdownChange}
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
            checked={mutableValues.availableActions.includes(action)}
            key={`availableAction.${action}`}
            onChange={handleChange}
          />
        ))}
      </Form.Group>
    </EditFormModal>
  );
};

export default ThermostatConfigurationModal;
