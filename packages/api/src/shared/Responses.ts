import { APIGatewayProxyResult } from "aws-lambda";

export default class Responses {
  public static success(body: any): APIGatewayProxyResult {
    return Responses.buildResponse(200, body);
  }

  public static badRequest(body: any): APIGatewayProxyResult {
    return Responses.buildResponse(400, body);
  }

  public static noTenantOrPermissions(): APIGatewayProxyResult {
    return Responses.buildResponse(401, "Unauthorized - no tenant or permissions defined");
  }

  public static internalError(body: any): APIGatewayProxyResult {
    return Responses.buildResponse(500, body);
  }

  private static buildResponse(statusCode: number, body: any): APIGatewayProxyResult {
    return {
      statusCode: statusCode,
      body: JSON.stringify(body, null, 0),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
}
