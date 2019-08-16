import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import "source-map-support/register";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";

import Authorizations from "../../auth/Authorizations";
import Responses from "../../shared/Responses";

const SSM = new AWS.SSM();

export const post: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  // Authorize (for testing purposes)
  const authorizations = new Authorizations(event);

  if (
    !authorizations.HasPermission(Authorization.Permissions.CrossTenantAdmin) ||
    !authorizations.HasPermission(Authorization.Permissions.WriteConfig)
  ) {
    return Responses.noTenantOrPermissions();
  }

  const keyName = process.env.PARTICLE_API_KEY_NAME;

  if (!keyName) {
    return Responses.internalError("API key name not provided");
  }

  const response = await SSM.getParameter({ Name: keyName, WithDecryption: true }).promise();

  if (!response.Parameter) {
    console.log("Bad response");
    console.log(response);

    return Responses.internalError("API key not decrypted");
  }

  return Responses.success({ whatever: "sure", keyName, decrypted: response.Parameter });
};
