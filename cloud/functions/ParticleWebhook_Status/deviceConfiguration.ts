import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

export class DeviceConfiguration {
  /**
   * @name DeviceConfiguration#setPoint
   * @default NaN
   *
   * Target temperature to maintain
   * Units: Celsius
   */
  public setPoint: number;

  /**
   * @name DeviceConfiguration#threshold
   * @default NaN
   *
   * Hysteresis threshold around target
   * Units: Celsius
   */
  public threshold: number;

  /**
   * @name DeviceConfiguration#cadence
   * @default NaN
   *
   * Operational cadence
   * Units: seconds
   */
  public cadence: number;

  /**
   * @name DeviceConfiguration#allowedModes
   * @default ""
   *
   * Allowed modes of operation:
   * - heating ("H")
   * - cooling ("C")
   * - circulation ("R")
   *
   * For example: "HCR"
   *
   * May be left empty if no operations are permitted.
   */
  public allowedModes: string;

  public constructor(context: Context, data: any) {
    this.setPoint = NaN;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedModes = "";

    const validator = ajvInstance.compile(
      require(context.executionContext.functionDirectory +
        "/../generated/schema/DeviceConfiguration.json")
    );

    if (!validator(data)) {
      throw validator.errors;
    }

    Object.assign(this, data);
  }
}
