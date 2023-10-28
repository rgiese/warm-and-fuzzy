import * as EditFormTools from "./EditFormTools";

import { Form, InputOnChangeData } from "semantic-ui-react";
import React, { useState } from "react";
import { SensorConfiguration, useRootStore } from "@grumpycorp/warm-and-fuzzy-shared-client";

import EditFormModal from "./EditFormModal";
import { SensorConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ValidationError } from "yup";

function SensorConfigurationModal({ values }: { values: SensorConfiguration }): React.ReactElement {
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
      header={
        <>
          {values.name} (<code>{values.id}</code>)
        </>
      }
      onSave={async (): Promise<void> => {
        await rootStore.sensorConfigurationStore.updateItem(mutableValues);
      }}
    >
      <Form.Input
        error={getFieldError("name")}
        label="Name"
        name="name"
        onChange={handleChange}
        value={mutableValues.name}
      />
      <Form.Input
        error={getFieldError("streamName")}
        label="Stream Name"
        name="streamName"
        onChange={handleChange}
        value={mutableValues.streamName}
      />
    </EditFormModal>
  );
}

export default SensorConfigurationModal;
