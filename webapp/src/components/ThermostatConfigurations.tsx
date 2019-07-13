import React from "react";
import gql from "graphql-tag";
import { Formik, Form, Field } from "formik";

import {
  ThermostatConfigurationsComponent,
  UpdateThermostatConfigurationComponent,
} from "../generated/graphqlClient";

gql`
  fragment ThermostatConfigurationFields on ThermostatConfiguration {
    deviceId
    name
    allowedActions
    cadence
    setPointHeat
    setPointCool
    threshold
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
                // We'll be sending the same object back for updates below
                // so remove injected fields that won't be accepted in a GraphQL update
                delete thermostatConfiguration.__typename;

                return (
                  <UpdateThermostatConfigurationComponent key={thermostatConfiguration.deviceId}>
                    {(mutateFn, { error }): React.ReactElement => {
                      return (
                        <>
                          <Formik
                            initialValues={thermostatConfiguration}
                            onSubmit={async (values, { setSubmitting }) => {
                              await mutateFn({
                                variables: {
                                  thermostatConfiguration: values,
                                },
                              });
                              setSubmitting(false);
                            }}
                          >
                            {({ isSubmitting }) => (
                              <Form>
                                <Field type="text" name="name" />
                                <Field type="text" name="setPointCool" />
                                <Field type="text" name="setPointHeat" />
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
