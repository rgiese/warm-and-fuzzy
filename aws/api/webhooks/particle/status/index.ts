import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import Responses from "../../../common/Responses";

export const post: APIGatewayProxyHandler = async event => {
  return Responses.success({
    message: `Hello Particle`,
    input: event,
  });
};
