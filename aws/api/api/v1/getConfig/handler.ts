import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const getConfig: APIGatewayProxyHandler = async event => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(
      {
        message: "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
