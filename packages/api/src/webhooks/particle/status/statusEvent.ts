import * as yup from "yup";

//
// For an example request body, see ./exampleEvent.json.
//

export const StatusEventSchema = yup.object().shape({
  event: yup
    .string()
    .required()
    .matches(/^status$/),
  deviceId: yup
    .string()
    .required()
    .lowercase()
    .matches(/^([a-f0-9]+)$/),
  publishedAt: yup.date().required(),
  firmwareVersion: yup
    .number()
    .positive()
    .integer(),
  data: yup.object().shape({
    ts: yup
      .number()
      .integer()
      .min(0),
    ser: yup
      .number()
      .integer()
      .min(0),
    ca: yup
      .string()
      .nullable()
      .matches(/^H?C?R?$/), // firmware should upload in H-C-R order
    v: yup
      .array()
      .required()
      .of(
        yup.object().shape({
          id: yup
            .string()
            .nullable()
            .lowercase()
            .matches(/^([a-fA0-9]{16})$/, { excludeEmptyString: true }),
          t: yup.number().required(),
          h: yup.number().nullable(),
        })
      ),
  }),
});

export type StatusEvent = yup.InferType<typeof StatusEventSchema>;