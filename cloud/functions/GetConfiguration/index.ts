import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { AzureTableStorage } from "../common/azureTableStorage";
import { authenticatedFunction, InjectedRequestHeaders } from "../common/authenticatedFunction";

import { DeviceConfiguration } from "../schema/deviceConfiguration";

const tableService = new AzureTableStorage();

const httpTrigger: AzureFunction = authenticatedFunction("read:config", async function(
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    context.log("Tenant: " + req.headers[InjectedRequestHeaders.Tenant]);

    // Retrieve device configuration data
    const deviceConfigurationJson = await tableService.TryRetrieveEntity(
      "deviceConfig",
      "default",
      "17002c001247363333343437"
    );

    const deviceConfiguration = new DeviceConfiguration(context, deviceConfigurationJson);

    // Return success response
    return {
      // Provide a compacted rendering of the JSON in the response (by default it's pretty)
      body: JSON.stringify(
        {
          sh: deviceConfiguration.setPointHeat,
          sc: deviceConfiguration.setPointCool,
          th: deviceConfiguration.threshold,
          ca: deviceConfiguration.cadence,
          aa: deviceConfiguration.allowedActions,
        },
        undefined,
        0
      ),

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
        details: error,
      },
    };
  }
});

export default httpTrigger;
