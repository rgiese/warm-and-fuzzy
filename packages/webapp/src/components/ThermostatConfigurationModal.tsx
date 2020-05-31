import * as EditFormTools from "./EditFormTools";

import { Checkbox, DropdownProps, Form, InputOnChangeData } from "semantic-ui-react";
import React, { useState } from "react";
import { ThermostatConfiguration, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import EditFormModal from "./EditFormModal";
import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ValidationError } from "yup";
import moment from "moment-timezone";

function ThermostatConfigurationModal({
  values,
}: {
  values: ThermostatConfiguration;
}): React.ReactElement {
  const [mutableValues, setMutableValues] = useState(values);
  const [validationError, setValidationError] = useState<ValidationError | undefined>(undefined);

  const rootStore = useRootStore();

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
      header={
        <>
          {values.name} (<code>{values.id}</code>)
        </>
      }
      onSave={async (): Promise<void> => {
        await rootStore.thermostatConfigurationStore.updateItem(mutableValues);
      }}
    >
      <Form.Group widths="equal">
        <Form.Input
          error={getFieldError("name")}
          fluid
          label="Name"
          name="name"
          onChange={handleChange}
          value={mutableValues.name}
        />

        <Form.Input
          error={getFieldError("streamName")}
          fluid
          label="Stream Name"
          name="streamName"
          onChange={handleChange}
          value={mutableValues.streamName}
        />
      </Form.Group>

      <Form.Group widths="equal">
        {/* We're deliberately leaving this as Celsius-only */}
        <Form.Input
          error={getFieldError("threshold")}
          fluid
          label="Threshold [&Delta;&deg;C]"
          max={ThermostatConfigurationSchema.ThresholdRange.max}
          min={ThermostatConfigurationSchema.ThresholdRange.min}
          name="threshold"
          onChange={handleChange}
          step={0.5}
          type="number"
          value={mutableValues.threshold}
        />

        <Form.Input
          error={getFieldError("cadence")}
          fluid
          label="Cadence [sec]"
          max={ThermostatConfigurationSchema.CadenceRange.max}
          min={ThermostatConfigurationSchema.CadenceRange.min}
          name="cadence"
          onChange={handleChange}
          step={10}
          type="number"
          value={mutableValues.cadence}
        />
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Input
          error={getFieldError("externalSensorId")}
          fluid
          label="External sensor ID"
          name="externalSensorId"
          onChange={handleChange}
          value={mutableValues.externalSensorId}
        />

        <Form.Select
          error={getFieldError("timezone")}
          fluid
          label="Timezone"
          name="timezone"
          onChange={handleDropdownChange}
          options={moment.tz.names().map(timezone => {
            return { text: timezone, value: timezone };
          })}
          value={mutableValues.timezone ?? ""}
        />
      </Form.Group>

      <Form.Group inline>
        <label>Available actions:</label>
        {ThermostatConfigurationSchema.Actions.map(action => (
          <Form.Field
            checked={mutableValues.availableActions.includes(action)}
            control={Checkbox}
            key={`availableAction.${action}`}
            label={action}
            name="availableActions"
            onChange={handleChange}
            value={action}
          />
        ))}
      </Form.Group>
    </EditFormModal>
  );
}

export default ThermostatConfigurationModal;
