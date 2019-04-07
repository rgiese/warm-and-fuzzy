import { Context, HttpRequest } from "@azure/functions";

import { validateSync } from "class-validator";
import { plainToClass } from "class-transformer";
import { ClassType } from "class-transformer/ClassTransformer";

import "reflect-metadata";

export function parseAndValidateRequest<T>(
  cls: ClassType<T>,
  context: Context,
  req: HttpRequest
): T {
  // TSC infers req.body as being an array type by default,
  // making it think that we're trying to invoke the array-consuming and -returning version of plainToClass.
  // Make sure req.body is not considered an array.
  const instance = plainToClass(cls, req.body as Object);
  {
    const validationErrors = validateSync(instance);

    if (validationErrors.length > 0) {
      context.log.error("Request body validation errors: ", validationErrors);

      context.res = {
        status: 400,
        body: {
          error: "request body validation errors",
          details: validationErrors,
        },
      };

      return undefined;
    }
  }
  return instance;
}
