import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

export class DeviceConfiguration {
  setPoint: number;

  constructor(context: Context, data: any) {
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
