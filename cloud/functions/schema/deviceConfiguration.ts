import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

export class DeviceConfiguration {
  /**
   * @name DeviceConfiguration#setPointHeat
   *
   * Target temperature for heating
   * Units: Celsius
   */
  public setPointHeat: number;

  /**
   * @name DeviceConfiguration#setPointCool
   *
   * Target temperature for cooling
   * Units: Celsius
   */
  public setPointCool: number;

  /**
   * @name DeviceConfiguration#threshold
   *
   * Hysteresis threshold around targets
   * Units: Celsius
   */
  public threshold: number;

  /**
   * @name DeviceConfiguration#cadence
   *
   * Operational cadence
   * Units: seconds
   */
  public cadence: number;

  /**
   * @name DeviceConfiguration#allowedActions
   *
   * Allowed actions:
   * - heating ("H")
   * - cooling ("C")
   * - circulation ("R")
   *
   * For example: "HCR"
   *
   * May be left empty if no actions are permitted.
   */
  public allowedActions: string;

  public constructor(context: Context, data: any) {
    this.setPointHeat = NaN;
    this.setPointCool = NaN;
    this.threshold = NaN;
    this.cadence = NaN;
    this.allowedActions = "";

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
