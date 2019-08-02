import * as yup from "yup";

export namespace SensorConfigurationSchema {
  export const Schema = yup.object().shape({
    sensorId: yup.string().required(),
    name: yup.string().required(),
  });
}
