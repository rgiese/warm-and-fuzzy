import { APIGatewayProxyResult } from "aws-lambda";

function buildResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body, null, 0),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}

const Responses = {
  success(body: any): APIGatewayProxyResult {
    return buildResponse(200, body);
  },

  badRequest(body: any): APIGatewayProxyResult {
    return buildResponse(400, body);
  },

  noTenantOrPermissions(): APIGatewayProxyResult {
    return buildResponse(401, "Unauthorized - no tenant or permissions defined");
  },

  internalError(body: any): APIGatewayProxyResult {
    return buildResponse(500, body);
  },
};

export default Responses;
