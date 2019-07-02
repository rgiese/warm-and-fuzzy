import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const postStatus: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Hello Particle`,
        input: event,
      },
      null,
      2
    ),
  };
};
