import * as Ajv from "ajv";
import { Context } from "@azure/functions";

const ajvInstance = new Ajv();

export class DeviceToTenant {
  public tenantName: string;

  public constructor(context: Context, data: any) {
    this.tenantName = "";

    const validator = ajvInstance.compile(
      require(context.executionContext.functionDirectory +
        "/../generated/schema/DeviceToTenant.json")
    );

    if (!validator(data)) {
      throw validator.errors;
    }

    Object.assign(this, data);
  }
}
