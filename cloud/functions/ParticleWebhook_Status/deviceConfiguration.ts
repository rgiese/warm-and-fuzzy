import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

export class DeviceConfiguration {
  public setPoint: number;

  public constructor(context: Context, data: any) {
    this.setPoint = NaN;

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
