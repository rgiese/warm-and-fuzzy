import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import {
  validateSync,
  Equals,
  IsInt,
  IsHexadecimal,
  ArrayUnique,
  IsNumber,
} from "class-validator";
import { plainToClass, Type } from "class-transformer";
import "reflect-metadata";

// See https://github.com/typestack/class-transformer
// See https://github.com/typestack/class-validator

//
// Example request body:
// {
//   "event": "status",
//   "data": {
//     "ts": 1554656303,
//     "temp": 23.6,
//     "hum": 41.5,
//     "ext": [
//       { "id": "2800581f0b0000d6", "temp": 22.9 },
//       { "id": "28c0e61d0b0000a3", "temp": 21.7 }
//     ]
//   },
//   "device_id": "17002c001247363333343437",
//   "published_at": "2019-04-07T16:58:25.604Z",
//   "fw_version": 1
// }
//
class StatusEvent {
  @Equals("status")
  event: string;

  @IsHexadecimal()
  device_id: string;

  @Type(() => Date)
  published_at: Date;

  @IsInt()
  fw_version: number;

  @Type(() => StatusEventData)
  data: StatusEventData;
}

class StatusEventData {
  @IsInt()
  ts: number;

  @IsNumber({ allowNaN: true }) // Allow NaN since the DHT22 fails to produce a measurement from time to time
  temp: number;

  @IsNumber({ allowNaN: true }) // (same)
  hum: number;

  @ArrayUnique()
  @Type(() => StatusEventExternalData)
  ext: StatusEventExternalData[];
}

class StatusEventExternalData {
  @IsHexadecimal()
  id: string;

  @IsNumber()
  temp: number;
}

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
