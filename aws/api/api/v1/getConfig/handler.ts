import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import Authorizations, { UnauthorizedResponse } from "../../auth/Authorizations";

export const getConfig: APIGatewayProxyHandler = async event => {
  const authorizations = event.requestContext.authorizer as Authorizations;

  if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
    return UnauthorizedResponse;
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(
      {
        message: `Welcome to ${authorizations.AuthorizedTenant}, you can ${authorizations.AuthorizedPermissions}`,
        input: event,
      },
      null,
      2
    ),
  };
};
