import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

//
// Example request body:
// {
//   "event": "status",
//   "data": {
//     "ts": 1554656303,
//     "v": [
//       { "t": 22.0, "h": 53.9 },
//       { "id": "2800581f0b0000d6", "t": 22.9 },
//       { "id": "28c0e61d0b0000a3", "t": 21.7 }
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

    v: Array<{
      /**
       * Hexadecimal OneWire device ID (optional, empty if from onboard sensor)
       * @pattern ^([a-fA-F0-9]*)$
       */
      id?: string;

      /**
       * Temperature
       */
      t: number;

      /**
       * Humidity
       */
      h?: number;
    }>;
  };

  constructor(context: Context, data: any) {
    const validator = ajvInstance.compile(
      require(context.executionContext.functionDirectory + "/../generated/schema/StatusEvent.json")
    );

    if (!validator(data)) {
      throw validator.errors;
    }

    Object.assign(this, data);
  }
}
