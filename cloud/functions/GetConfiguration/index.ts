import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as AzureStorage from "azure-storage";

import { AzureTableStorage } from "../common/azureTableStorage";
import { authenticatedFunction, InjectedRequestHeaders } from "../common/authenticatedFunction";

import { DeviceConfiguration } from "../schema/deviceConfiguration";

const tableService = new AzureTableStorage();

const httpTrigger: AzureFunction = authenticatedFunction("read:config", async function(
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    const tenant = req.headers[InjectedRequestHeaders.Tenant];
    context.log("Tenant: " + tenant);

    // Retrieve device configuration data
    const deviceConfigurations = await tableService.QueryEntities(
      "deviceConfig",
      new AzureStorage.TableQuery().where("PartitionKey eq ?", tenant),
      DeviceConfiguration
    );

    // Return success response
    return {
      // Provide a compacted rendering of the JSON in the response (by default it's pretty)
      body: JSON.stringify(deviceConfigurations, undefined, 0),

      // Force JSON content type
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    context.log.error(error);

    return {
      status: 500,
      body: {
        error: "exception",
        message: error.message,
      },
    };
  }
});

export default httpTrigger;
