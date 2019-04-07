import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { validateSync } from "class-validator";
import { plainToClass } from "class-transformer";
import "reflect-metadata";

import { StatusEvent } from "./statusEvent";

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  //
  // Parse incoming status data
  //

  // TSC infers req.body as being an array type by default,
  // making it think that we're trying to invoke the array-consuming and -returning version of plainToClass.
  // Make sure req.body is not considered an array.
  const statusEvent = plainToClass(StatusEvent, req.body as Object);
  {
    const validationErrors = validateSync(statusEvent);

    if (validationErrors.length > 0) {
      context.log.error("Request body validation errors: ", validationErrors);

      context.res = {
        status: 400,
        body: {
          error: "request body validation errors",
          details: validationErrors,
        },
      };

      return;
    }
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
