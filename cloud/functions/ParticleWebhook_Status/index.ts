import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { parseAndValidateRequest } from "../common/parseRequest";

import { StatusEvent } from "./statusEvent";

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  //
  // Parse incoming status data
  //

  const statusEvent = parseAndValidateRequest(StatusEvent, context, req);

  if (statusEvent === null) {
    // parseAndValidateRequest set up the appropriate response already
    return;
  }

  context.log("Parsed body: ", statusEvent);
  statusEvent.data.ext.map(x => context.log(x));

  //
  // Return response
  //

  context.res = {
    // Provide a compacted rendering of the JSON in the response (by default it's pretty)
    body: JSON.stringify({ foo: "bar" }, undefined, 0),

    // Force JSON content type
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export default httpTrigger;
