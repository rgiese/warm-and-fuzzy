import { InputOnChangeData } from "semantic-ui-react";
import { ValidateOptions, ValidationError } from "yup";

interface Schema {
  validate(value: any, options?: ValidateOptions | undefined): Promise<any>;
}

interface Values {
  [key: string]: any;
}

interface ChangeResult<T extends Values> {
  values: T;
  validationError?: ValidationError;
}

export async function handleChange<T extends Values, TSchema extends Schema>(
  values: T,
  schema: TSchema,
  data: InputOnChangeData
): Promise<ChangeResult<T> | undefined> {
  if (!values.hasOwnProperty(data.name)) {
    return undefined;
  }

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
      if (!Array.isArray(values[data.name])) {
        throw new Error(`Expected array property for field ${data.name}`);
      }

      value = values[data.name].filter((a: string) => a !== data.value);

      if (data.checked) {
        value.push(data.value);
      }

      break;
  }

  const updatedValues = {
    ...values,
    [data.name]: value,
  } as T;

  let validationError: ValidationError | undefined = undefined;

  try {
    await schema.validate(updatedValues);
  } catch (error) {
    validationError = error;
  }

  return { values: updatedValues, validationError };
}

interface FormState<T> {
  values: T;
  validationError?: ValidationError;
}

export function getFieldError<T extends Values>(
  state: FormState<T>,
  field: string
): any | undefined {
  if (!state.values.hasOwnProperty(field)) {
    return undefined;
  }

  if (!state.validationError) {
    return undefined;
  }

  if (state.validationError.path === field) {
    return { content: state.validationError.message, pointing: "below" };
  }

  return undefined;
}
