import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import Authorizations from "../../../auth/Authorizations";

import Responses from "../../../shared/Responses";
import { DbMapper, LatestAction, LatestValue } from "../../../shared/db";

export const list: APIGatewayProxyHandler = async event => {
  // Authorize
  const authorizations = event.requestContext.authorizer as Authorizations;

  if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
    return Responses.noTenantOrPermissions();
  }

  // Retrieve latest actions
  let latestActions: LatestAction[] = [];

  for await (const latestAction of DbMapper.query(LatestAction, {
    tenant: authorizations.AuthorizedTenant,
  })) {
    latestActions.push(latestAction);
  }

  // Retrieve latest Actions
  let latestValues: LatestValue[] = [];

  for await (const latestValue of DbMapper.query(LatestValue, {
    tenant: authorizations.AuthorizedTenant,
  })) {
    latestValues.push(latestValue);
  }

  // Build response
  return Responses.success({
    actions: latestActions,
    values: latestValues,
  });
};
