import React, { useState } from "react";
import { Form, InputOnChangeData } from "semantic-ui-react";
import { ValidationError } from "yup";

import { SensorConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { useRootStore, SensorConfiguration } from "@grumpycorp/warm-and-fuzzy-shared-client";

import EditFormModal from "./EditFormModal";
import * as EditFormTools from "./EditFormTools";

const SensorConfigurationModal: React.FunctionComponent<{
  values: SensorConfiguration;
}> = ({ values }): React.ReactElement => {
  const [mutableValues, setMutableValues] = useState(values);
  const [validationError, setValidationError] = useState<ValidationError | undefined>(undefined);

  const rootStore = useRootStore();

  const handleChange = async (
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ): Promise<void> => {
    const handleChangeResult = await EditFormTools.handleChange(
      mutableValues,
      SensorConfigurationSchema.Schema,
      data as EditFormTools.OnChangeData // name="" defined for each control below
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
        await rootStore.sensorConfigurationStore.updateItem(mutableValues);
      }}
      header={
        <>
          {values.name} (<code>{values.id}</code>)
        </>
      }
    >
      <Form.Input
        label="Name"
        name="name"
        error={getFieldError("name")}
        value={mutableValues.name}
        onChange={handleChange}
      />
      <Form.Input
        label="Stream Name"
        name="streamName"
        error={getFieldError("streamName")}
        value={mutableValues.streamName}
        onChange={handleChange}
      />
    </EditFormModal>
  );
};

export default SensorConfigurationModal;
