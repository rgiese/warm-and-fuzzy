import React from "react";
import gql from "graphql-tag";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";

import {
  ThermostatConfigurationsComponent,
  UpdateThermostatConfigurationComponent,
} from "../generated/graphqlClient";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

gql`
  fragment ThermostatConfigurationFields on ThermostatConfiguration {
    id
    name
    streamName
    availableActions
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

const ThermostatConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <ThermostatConfigurationsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getThermostatConfigurations) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        return (
          <div className="dt tl sans center mw-8 pt3">
            <div className="dtr b ba b--black">
              <div className="dtc pa2">Id</div>
              <div className="dtc pa2">Name</div>
              <div className="dtc pa2">Stream Name</div>
              <div className="dtc pa2">Allowed actions</div>
              <div className="dtc pa2">Cool to</div>
              <div className="dtc pa2">Heat to</div>
              <div className="dtc pa2">Threshold</div>
              <div className="dtc pa2">Cadence</div>
              <div className="dtc pa2">Available actions</div>
              <div className="dtc pa2"></div> {/* Submit button */}
            </div>
            {data.getThermostatConfigurations.map(
              (thermostatConfiguration): React.ReactElement => {
                return (
                  <UpdateThermostatConfigurationComponent key={thermostatConfiguration.id}>
                    {(mutateFn, { error }): React.ReactElement => {
                      return (
                        <>
                          <Formik
                            initialValues={thermostatConfiguration}
                            validationSchema={ThermostatConfigurationSchema.Schema}
                            onSubmit={async (values, { resetForm }) => {
                              // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
                              delete values.__typename;

                              await mutateFn({
                                variables: {
                                  thermostatConfiguration: values,
                                },
                              });

                              resetForm(values);
                            }}
                          >
                            {({ values, dirty, isSubmitting }) => (
                              <Form className="dtr">
                                <div className="dtc pa2">{values.id}</div>

                                <div className="dtc pa2">
                                  <Field type="text" name="name" />
                                  <ErrorMessage name="name" component="div" />
                                </div>

                                <div className="dtc pa2">
                                  <Field type="text" name="streamName" />
                                  <ErrorMessage name="streamName" component="div" />
                                </div>

                                <div className="dtc">
                                  <FieldArray
                                    name="allowedActions"
                                    render={arrayHelpers => (
                                      <>
                                        {ThermostatConfigurationSchema.Actions.map(action => (
                                          <label className="pa2" key={action}>
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
                                </div>

                                <div className="dtc pa2">
                                  <Field
                                    className="w3 tr"
                                    type="number"
                                    name="setPointCool"
                                    min={ThermostatConfigurationSchema.SetPointRange.min}
                                    max={ThermostatConfigurationSchema.SetPointRange.max}
                                    step={0.5}
                                  />{" "}
                                  &deg;C
                                  <ErrorMessage name="setPointCool" component="div" />
                                </div>

                                <div className="dtc pa2">
                                  <Field
                                    className="w3 tr"
                                    type="number"
                                    name="setPointHeat"
                                    min={ThermostatConfigurationSchema.SetPointRange.min}
                                    max={ThermostatConfigurationSchema.SetPointRange.max}
                                    step={0.5}
                                  />{" "}
                                  &deg;C
                                  <ErrorMessage name="setPointHeat" component="div" />
                                </div>

                                <div className="dtc pa2">
                                  <Field
                                    className="w3 tr"
                                    type="number"
                                    name="threshold"
                                    min={ThermostatConfigurationSchema.ThresholdRange.min}
                                    max={ThermostatConfigurationSchema.ThresholdRange.max}
                                    step={0.5}
                                  />{" "}
                                  &Delta;&deg;C
                                  <ErrorMessage name="threshold" component="div" />
                                </div>

                                <div className="dtc pa2">
                                  <Field
                                    className="w3 tr"
                                    type="number"
                                    name="cadence"
                                    min={ThermostatConfigurationSchema.CadenceRange.min}
                                    max={ThermostatConfigurationSchema.CadenceRange.max}
                                    step={10}
                                  />{" "}
                                  sec
                                  <ErrorMessage name="cadence" component="div" />
                                </div>

                                <div className="dtc">
                                  <FieldArray
                                    name="availableActions"
                                    render={arrayHelpers => (
                                      <>
                                        {ThermostatConfigurationSchema.Actions.map(action => (
                                          <label className="pa2" key={action}>
                                            <input
                                              name="availableActions"
                                              type="checkbox"
                                              value={action}
                                              checked={values.availableActions.includes(action)}
                                              onChange={e => {
                                                if (e.target.checked) {
                                                  arrayHelpers.push(action);
                                                } else {
                                                  const idxItem = values.availableActions.indexOf(
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
                                </div>

                                <div className="dtc pa2">
                                  {dirty && (
                                    <button type="submit" disabled={isSubmitting}>
                                      {isSubmitting ? "Saving..." : "Save"}
                                    </button>
                                  )}
                                </div>
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
          </div>
        );
      }}
    </ThermostatConfigurationsComponent>
  );
};

export default ThermostatConfigs;
