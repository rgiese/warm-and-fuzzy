import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import Authorizations, { UnauthorizedResponse } from "../../auth/Authorizations";

import ThermostatConfiguration from "../../../types/db/ThermostatConfiguration";
import DbMapper from "../../../types/db/DbMapper";

export const get: APIGatewayProxyHandler = async event => {
  const authorizations = event.requestContext.authorizer as Authorizations;

  if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
    return UnauthorizedResponse;
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  // const testConfig = Object.assign(new ThermostatConfiguration(), {
  //   tenant: "AmazingHouse",
  //   deviceId: "test2",
  //   setPointHeat: 18.0,
  //   setPointCool: 22.5,
  //   threshold: 0.5,
  //   cadence: 120,
  //   allowedActions: "CR",
  // });

  // await dbMapper.put(testConfig);

  let configs: ThermostatConfiguration[] = [];

  for await (const config of DbMapper.query(ThermostatConfiguration, {
    tenant: authorizations.AuthorizedTenant,
  })) {
    configs.push(config);
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(
      {
        message: `Welcome to ${authorizations.AuthorizedTenant}, you can ${
          authorizations.AuthorizedPermissions
        } over ${JSON.stringify(configs)}`,
        input: event,
      },
      null,
      2
    ),
  };
};
