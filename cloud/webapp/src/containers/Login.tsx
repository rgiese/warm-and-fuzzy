import React from "react";
import { Auth } from "aws-amplify";
import { Formik, Field, Form, FormikActions } from "formik";

import { CognitoUser } from "amazon-cognito-identity-js";

import AuthStateProps from "../common/AuthStateProps";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props extends AuthStateProps {}

class State {}

interface LoginFormValues {
  email: string;
  password: string;
}

class Login extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = new State();
  }

  public render(): React.ReactElement {
    return (
      <div className="Login">
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={async (
            values: LoginFormValues,
            { setSubmitting }: FormikActions<LoginFormValues>
          ): Promise<void> => {
            try {
              // Enable for auth debugging
              //(window as any).LOG_LEVEL = 'DEBUG';

              const currentUser = (await Auth.signIn(values.email, values.password)) as CognitoUser;

              //
              // If the user was added to Cognito by an admin, it seems that we need to change their password for them
              // in order to get their full credentials returned for them.
              // Just use the same password that was already set for them.
              //
              if ((currentUser as any).challengeName === "NEW_PASSWORD_REQUIRED") {
                currentUser.completeNewPasswordChallenge(
                  values.password,
                  {},
                  {
                    onSuccess: (session): void => {},
                    onFailure: (err): void => {
                      alert(err);
                    },
                  }
                );
              }

              setSubmitting(false);
              this.props.setUserHasAuthenticated(true);
            } catch (e) {
              setSubmitting(false);
              alert(e.message);
            }
          }}
          render={(): React.ReactElement => (
            <Form>
              <label htmlFor="email">Email</label>
              <Field id="email" name="email" placeholder="john@acme.com" type="email" />

              <label htmlFor="password">Password</label>
              <Field id="password" name="password" placeholder="foo" type="password" />

              <button type="submit" style={{ display: "block" }}>
                Submit
              </button>
            </Form>
          )}
        />
      </div>
    );
  }
}

export default Login;
