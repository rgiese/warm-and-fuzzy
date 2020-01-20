import * as yup from "yup";

import { ThermostatSettingSchema } from "./ThermostatSettingSchema";

export namespace ThermostatSettingsSchema {
  export const Schema = yup.object().shape({
    id: yup.string().required(),
    settings: yup.array().of(ThermostatSettingSchema.Schema),
  });
}
