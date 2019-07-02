class MalformedData extends Error {}

const hexStringRegEx = /^([a-fA-F0-9]+)$/;
const dateTimeRegEx = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/;

//
// Example request body:
// {
//   "event": "status",
//   "data": {
//     "ts": 1554656303,
//     "ser": 42,
//     "ca": "C",
//     "v": [
//       { "t": 22.0, "h": 53.9 },
//       { "id": "2800581f0b0000d6", "t": 22.9 },
//       { "id": "28c0e61d0b0000a3", "t": 21.7 }
//     ]
//   },
//   "deviceId": "17002c001247363333343437",
//   "publishedAt": "2019-04-07T16:58:25.604Z",
//   "firmwareVersion": 1
// }
//
// Type-wise this becomes:
//
//   StatusEvent {
//      ...
//      data: StatusEventData {
//         ...
//         v: StatusEventMeasurement[]
//      }
//   }
//
// A note on data validation:
//
//   The constructors are used to ensure that the incoming data looks good
//   (while also applying some normalizing like lower-casing hex strings).
//
//   This is a bunch of onerous manual coding but in the end it's probably the lesser of two evils.
//
//   Previously we'd used ajv and typescript-json-schema,
//   but they added not insignificantly to our build time and complexity and it just wasn't worth it.
//
//   Alas.
//

export class StatusEventMeasurement {
  /**
   * Hexadecimal OneWire device ID (optional, empty if from onboard sensor)
   */
  public id?: string;

  /**
   * Temperature
   */
  public t: number;

  /**
   * Humidity
   */
  public h?: number;

  public constructor(rhs: any) {
    switch (typeof rhs.id) {
      case "undefined":
        this.id = undefined;
        break;

      case "string":
        if (!hexStringRegEx.test(rhs.id)) {
          throw new MalformedData("data.v.id");
        }
        this.id = rhs.id.toLowerCase();
        break;

      default:
        throw new MalformedData("data.v.id");
    }

    this.t = rhs.t;

    if (typeof rhs.h !== "undefined" && typeof rhs.h !== "number") {
      throw new MalformedData("data.v.h");
    }

    this.h = rhs.h;
  }
}

export class StatusEventData {
  /**
   * Device time when sample was collect
   */
  public ts: number;

  /**
   * Serial number (monotonically increasing on device, resets at reboot)
   */
  public ser: number;

  /**
   * Current actions (e.g. "CR")
   */
  public ca: string;

  /**
   * Measurements
   */
  public v: StatusEventMeasurement[];

  public constructor(rhs: any) {
    if (!rhs.ts || typeof rhs.ts !== "number") {
      throw new MalformedData("data.ts");
    }

    this.ts = rhs.ts;

    if (!rhs.ser || typeof rhs.ser !== "number") {
      throw new MalformedData("data.ser");
    }

    this.ser = rhs.ser;

    if (!rhs.ca || typeof rhs.ca !== "string") {
      throw new MalformedData("data.ca");
    }

    this.ca = rhs.ca;

    if (!Array.isArray(rhs.v)) {
      throw new MalformedData("data.v");
    }

    this.v = rhs.v.map((v: any) => new StatusEventMeasurement(v));
  }
}

export class StatusEvent {
  public event: string;
  public deviceId: string;
  public publishedAt: Date;
  public firmwareVersion: number;
  public data: StatusEventData;

  public constructor(rhs: any) {
    if (!rhs.event || rhs.event !== "status") {
      throw new MalformedData("event");
    }

    this.event = rhs.event;

    if (!rhs.deviceId || !hexStringRegEx.test(rhs.deviceId)) {
      throw new MalformedData("deviceId");
    }

    this.deviceId = rhs.deviceId.toLowerCase();

    if (!rhs.publishedAt || !dateTimeRegEx.test(rhs.publishedAt)) {
      throw new MalformedData("publishedAt");
    }
    this.publishedAt = rhs.publishedAt;

    if (!rhs.firmwareVersion) {
      throw new MalformedData("firmwareVersion");
    }

    this.firmwareVersion = rhs.firmwareVersion;

    if (!rhs.data || typeof rhs.data !== "object") {
      throw new MalformedData("data");
    }

    this.data = new StatusEventData(rhs.data);
  }
}
