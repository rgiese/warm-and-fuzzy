import React from "react";
import gql from "graphql-tag";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as yup from "yup";

import {
  ThermostatAction,
  ThermostatConfigurationsComponent,
  UpdateThermostatConfigurationComponent,
} from "../generated/graphqlClient";

gql`
  fragment ThermostatConfigurationFields on ThermostatConfiguration {
    deviceId
    name
    allowedActions
    setPointHeat
    setPointCool
    threshold
    cadence
  }

  query ThermostatConfigurations {
    getThermostatConfigurations {
      ...ThermostatConfigurationFields
    }
  }

  mutation UpdateThermostatConfiguration(
    $thermostatConfiguration: ThermostatConfigurationUpdateInput!
  ) {
    updateThermostatConfiguration(thermostatConfiguration: $thermostatConfiguration) {
      ...ThermostatConfigurationFields
    }
  }
`;

const thermostatActions = [
  ThermostatAction.Heat,
  ThermostatAction.Cool,
  ThermostatAction.Circulate,
];

const setPointRange = { min: 16, max: 40 };
const thresholdRange = { min: 0.5, max: 5 };
const cadenceRange = { min: 30, max: 3600 };

const thermostatConfigurationSchema = yup.object().shape({
  deviceId: yup.string().required(),
  name: yup.string().required(),
  allowedActions: yup.array().of(yup.string().oneOf(thermostatActions)),
  setPointHeat: yup
    .number()
    .min(setPointRange.min)
    .max(setPointRange.max),
  setPointCool: yup
    .number()
    .min(setPointRange.min)
    .max(setPointRange.max),
  threshold: yup
    .number()
    .min(thresholdRange.min)
    .max(thresholdRange.max),
  cadence: yup
    .number()
    .integer()
    .min(cadenceRange.min)
    .max(cadenceRange.max),
});

const ThermostatConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <ThermostatConfigurationsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) return <p>Loading...</p>;
        if (error || !data || !data.getThermostatConfigurations)
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );

        return (
          <>
            {data.getThermostatConfigurations.map(
              (thermostatConfiguration): React.ReactElement => {
                return (
                  <UpdateThermostatConfigurationComponent key={thermostatConfiguration.deviceId}>
                    {(mutateFn, { error }): React.ReactElement => {
                      return (
                        <>
                          <Formik
                            initialValues={thermostatConfiguration}
                            validationSchema={thermostatConfigurationSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                              // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
                              delete values.__typename;

                              await mutateFn({
                                variables: {
                                  thermostatConfiguration: values,
                                },
                              });
                              setSubmitting(false);
                            }}
                          >
                            {({ values, isSubmitting }) => (
                              <Form>
                                <Field type="text" name="name" />
                                <ErrorMessage name="name" component="div" />

                                <FieldArray
                                  name="allowedActions"
                                  render={arrayHelpers => (
                                    <>
                                      {thermostatActions.map(action => (
                                        <label key={action}>
                                          <input
                                            name="allowedActions"
                                            type="checkbox"
                                            value={action}
                                            checked={values.allowedActions.includes(action)}
                                            onChange={e => {
                                              if (e.target.checked) {
                                                arrayHelpers.push(action);
                                              } else {
                                                const idxItem = values.allowedActions.indexOf(
                                                  action
                                                );
                                                arrayHelpers.remove(idxItem);
                                              }
                                            }}
                                          />
                                          {action}
                                        </label>
                                      ))}
                                    </>
                                  )}
                                />

                                <Field
                                  type="number"
                                  name="setPointCool"
                                  min={setPointRange.min}
                                  max={setPointRange.max}
                                  step={0.5}
                                />
                                <ErrorMessage name="setPointCool" component="div" />

                                <Field
                                  type="number"
                                  name="setPointHeat"
                                  min={setPointRange.min}
                                  max={setPointRange.max}
                                  step={0.5}
                                />
                                <ErrorMessage name="setPointHeat" component="div" />

                                <Field
                                  type="number"
                                  name="threshold"
                                  min={thresholdRange.min}
                                  max={thresholdRange.max}
                                  step={0.5}
                                />
                                <ErrorMessage name="threshold" component="div" />

                                <Field
                                  type="number"
                                  name="cadence"
                                  min={cadenceRange.min}
                                  max={cadenceRange.max}
                                  step={10}
                                />
                                <ErrorMessage name="cadence" component="div" />

                                <button type="submit" disabled={isSubmitting}>
                                  Update
                                </button>
                              </Form>
                            )}
                          </Formik>
                          {error && (
                            <p>
                              Error: <pre>{JSON.stringify(error, null, 2)}</pre>
                            </p>
                          )}
                        </>
                      );
                    }}
                  </UpdateThermostatConfigurationComponent>
                );
              }
            )}
          </>
        );
      }}
    </ThermostatConfigurationsComponent>
  );
};

export default ThermostatConfigs;
