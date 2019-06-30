import { Auth } from "aws-amplify";
import ApiGatewayClientFactory from "aws-api-gateway-client";
import * as Axios from "axios";

import config from "../config";

// Note: anything other than an HTTP 200 = success should throw an exception
export default async (
  verb: string,
  pathTemplate: string,
  body?: string
): Promise<Axios.AxiosResponse> => {
  const currentUserCredentials = await Auth.currentUserCredentials();

  var apiGatewayClient = ApiGatewayClientFactory.newClient({
    //apiKey: argv.apiKey,
    accessKey: currentUserCredentials.accessKeyId,
    secretKey: currentUserCredentials.secretAccessKey,
    sessionToken: currentUserCredentials.sessionToken,
    region: config.apiGateway.REGION,
    invokeUrl: config.apiGateway.URL,
  });

  const result = await apiGatewayClient.invokeApi({}, pathTemplate, verb, {}, {});

  return result;
};
