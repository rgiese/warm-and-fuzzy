import { AuthResponseContext, APIGatewayProxyResult } from "aws-lambda";

export default interface Authorizations extends AuthResponseContext {
  // AWS won't let us use anything except numbers and strings here
  // so AuthorizedPermissions is a comma-delimited string, sadly.
  AuthorizedTenant: string;
  AuthorizedPermissions: string;
}

export const UnauthorizedResponse: APIGatewayProxyResult = {
  statusCode: 401,
  body: "Unauthorized - no tenant or permissions defined",
  headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": true },
};
