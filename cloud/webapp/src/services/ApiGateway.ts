import axios, { AxiosResponse, Method } from "axios";

import config from "../config";
import { GlobalAuth } from "../services/Auth";

// Note: anything other than an HTTP 200 = success should throw an exception
export default async (method: Method, pathTemplate: string): Promise<AxiosResponse> => {
  return await axios.request({
    url: new URL(pathTemplate, config.apiGateway.URL).href,
    method: method,
    headers: {
      Authorization: `Bearer ${GlobalAuth.AccessToken}`,
    },
  });
};
