import React from "react";
import gql from "graphql-tag";
import { Formik, Form, Field, ErrorMessage } from "formik";

import {
  SensorConfigurationsComponent,
  UpdateSensorConfigurationComponent,
} from "../generated/graphqlClient";

import { SensorConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

gql`
  fragment SensorConfigurationFields on SensorConfiguration {
    sensorId
    name
  }

  query SensorConfigurations {
    getSensorConfigurations {
      ...SensorConfigurationFields
    }
  }

  mutation UpdateSensorConfiguration($sensorConfiguration: SensorConfigurationUpdateInput!) {
    updateSensorConfiguration(sensorConfiguration: $sensorConfiguration) {
      ...SensorConfigurationFields
    }
  }
`;

const SensorConfigs: React.FunctionComponent<{}> = (): React.ReactElement => {
  return (
    <SensorConfigurationsComponent>
      {({ loading, error, data }): React.ReactElement => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (error || !data || !data.getSensorConfigurations) {
          return (
            <p>
              Error: <pre>{JSON.stringify(error)}</pre>
            </p>
          );
        }

        return (
          <div className="dt tl sans center mw-8 pt3">
            <div className="dtr b ba b--black">
              <div className="dtc pa2">ID</div>
              <div className="dtc pa2">Name</div>
              <div className="dtc pa2"></div> {/* Submit button */}
            </div>
            {data.getSensorConfigurations.map(
              (sensorConfiguration): React.ReactElement => {
                return (
                  <UpdateSensorConfigurationComponent key={sensorConfiguration.sensorId}>
                    {(mutateFn, { error }): React.ReactElement => {
                      return (
                        <>
                          <Formik
                            initialValues={sensorConfiguration}
                            validationSchema={SensorConfigurationSchema.Schema}
                            onSubmit={async (values, { resetForm }) => {
                              // Remove GraphQL-injected fields that won't be accepted in a GraphQL update
                              delete values.__typename;

                              await mutateFn({
                                variables: {
                                  sensorConfiguration: values,
                                },
                              });

                              resetForm(values);
                            }}
                          >
                            {({ values, dirty, isSubmitting }) => (
                              <Form className="dtr">
                                <div className="dtc pa2">
                                  <pre>{values.sensorId}</pre>
                                </div>

                                <div className="dtc pa2">
                                  <Field type="text" name="name" />
                                  <ErrorMessage name="name" component="div" />
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
                  </UpdateSensorConfigurationComponent>
                );
              }
            )}
          </div>
        );
      }}
    </SensorConfigurationsComponent>
  );
};

export default SensorConfigs;
