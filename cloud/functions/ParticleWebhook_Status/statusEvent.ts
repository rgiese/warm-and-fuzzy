import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

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
export class StatusEvent {
  event: "status";

  /**
   * Hexadecimal Particle device ID
   * @pattern ^([a-fA-F0-9]*)$
   */
  device_id: string;

  published_at: Date;

  /**
   * @type integer
   */
  fw_version: number;

  data: {
    /**
     * @type integer
     */
    ts: number;

    temp: number | "NaN";
    hum: number | "NaN";

    ext: Array<{
      /**
       * Hexadecimal OneWire device ID
       * @pattern ^([a-fA-F0-9]*)$
       */
      id: string;

      temp: number;
    }>;
  };

  constructor(context: Context, data: any)
  {
    const validator = ajvInstance.compile(
      require(context.executionContext.functionDirectory + "/../generated/schema/StatusEvent.json")
    );

    if (!validator(data)) {
      throw validator.errors;
    }

    Object.assign(this, data);
  }
}
