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
  public event: "status";

  /**
   * Hexadecimal Particle device ID
   * @pattern ^([a-fA-F0-9]*)$
   */
  public deviceId: string;

  public publishedAt: Date;

  /**
   * @type integer
   */
  public firmwareVersion: number;

  public data: {
    /**
     * @type integer
     */
    ts: number;

    /**
     * @type integer
     */
    ser: number;

    ca: string;

    v: {
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
    }[];
  };

  public constructor(context: Context, data: any) {
    this.event = "status";
    this.deviceId = "";
    this.publishedAt = new Date(0);
    this.firmwareVersion = 0;
    this.data = { ts: 0, ser: 0, ca: "", v: [] };

    const validator = ajvInstance.compile(
      require(context.executionContext.functionDirectory + "/../generated/schema/StatusEvent.json")
    );

    if (!validator(data)) {
      throw validator.errors;
    }

    Object.assign(this, data);
  }
}
