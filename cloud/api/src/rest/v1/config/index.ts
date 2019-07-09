import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import Authorizations from "../../../auth/Authorizations";

import Responses from "../../../shared/Responses";
import { DbMapper, ThermostatConfiguration } from "../../../shared/db";

export const list: APIGatewayProxyHandler = async event => {
  const authorizations = event.requestContext.authorizer as Authorizations;

  if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
    return Responses.noTenantOrPermissions();
  }

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

  return Responses.success({
    message: `Welcome to ${authorizations.AuthorizedTenant}, you can ${
      authorizations.AuthorizedPermissions
    } over ${JSON.stringify(configs)}`,
    input: event,
  });
};
