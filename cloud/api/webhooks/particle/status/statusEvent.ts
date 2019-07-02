class MalformedData extends Error {}

const hexStringRegEx = /^([a-fA-F0-9]+)$/;
const dateTimeRegEx = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/;

//
// For an example request body, see ./exampleEvent.json.
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

    if (typeof rhs.t !== "number") {
      throw new MalformedData("data.v.t");
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
    if (typeof rhs.ts !== "number") {
      throw new MalformedData("data.ts");
    }

    this.ts = rhs.ts;

    if (typeof rhs.ser !== "number") {
      throw new MalformedData("data.ser");
    }

    this.ser = rhs.ser;

    if (typeof rhs.ca !== "string") {
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

    if (typeof rhs.deviceId !== "string" || !hexStringRegEx.test(rhs.deviceId)) {
      throw new MalformedData("deviceId");
    }

    this.deviceId = rhs.deviceId.toLowerCase();

    if (typeof rhs.publishedAt !== "string" || !dateTimeRegEx.test(rhs.publishedAt)) {
      throw new MalformedData("publishedAt");
    }
    this.publishedAt = rhs.publishedAt;

    if (typeof rhs.firmwareVersion !== "number") {
      throw new MalformedData("firmwareVersion");
    }

    this.firmwareVersion = rhs.firmwareVersion;

    if (typeof rhs.data !== "object") {
      throw new MalformedData("data");
    }

    this.data = new StatusEventData(rhs.data);
  }
}
