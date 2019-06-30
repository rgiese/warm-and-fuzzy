import axios, { AxiosResponse } from "axios";

import { GlobalAuth } from "../services/Auth";

// Note: anything other than an HTTP 200 = success should throw an exception
export default async (
  verb: string,
  pathTemplate: string,
  body?: string
): Promise<AxiosResponse> => {
  const headers = { Authorization: `Bearer ${GlobalAuth.AccessToken}` };

  const result = await axios.get(`https://warmandfuzzy.azurewebsites.net/api/v1/getconfig`, {
    headers,
  });

  return result;
};
