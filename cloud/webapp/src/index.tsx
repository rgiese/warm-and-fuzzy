import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";

import config from "./config";

import "./index.css";

import App from "./App";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: "warm-and-fuzzy-api",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    ],
  },
  Analytics: {
    disabled: true,
  },
});

ReactDOM.render(<App />, document.getElementById("root"));
