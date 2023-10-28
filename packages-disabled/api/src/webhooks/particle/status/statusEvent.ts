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
  data: yup
    .object()
    .required()
    .shape({
      // Header
      ts: yup
        .number()
        .integer()
        .min(0),
      ser: yup
        .number()
        .integer()
        .min(0),
      // Status
      t: yup.number().required(),
      t2: yup.number().notRequired(), // temperature value from onboard sensor if external sensor override was used
      h: yup.number().required(),
      ca: yup
        .string()
        .min(0) // string needs to be present but can be empty
        .matches(/^H?C?R?$/), // firmware should upload in H-C-R order
      // Configuration
      cc: yup
        .object()
        .required()
        .shape({
          sh: yup.number().required(), // setPointHeat
          sc: yup.number().required(), // setPointCool
          sa: yup.number().required(), // setPointCirculateAbove
          sb: yup.number().required(), // setPointCirculateBelow
          th: yup.number().required(),
          tz: yup
            .number()
            .integer()
            .required(),
          aa: yup
            .string()
            .min(0) // string needs to be present but can be empty
            .matches(/^H?C?R?$/), // firmware should upload in H-C-R order
        }),
      // Measurements
      v: yup
        .array()
        .min(0)
        .of(
          yup.object().shape({
            id: yup
              .string()
              .required()
              .lowercase()
              .matches(/^([a-f0-9]{16})$/, { excludeEmptyString: true }),
            t: yup.number().required(),
          })
        ),
    }),
});

export type StatusEvent = yup.InferType<typeof StatusEventSchema>;
