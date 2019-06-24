import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as AzureStorage from "azure-storage";

import { AzureTableStorage } from "../common/azureTableStorage";
import { authenticatedFunction, InjectedRequestHeaders } from "../common/authenticatedFunction";

const tableService = new AzureTableStorage();

const httpTrigger: AzureFunction = authenticatedFunction("read:config", async function(
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    const tenantName = req.headers[InjectedRequestHeaders.Tenant];
    context.log("Tenant: " + tenantName);

    // Retrieve device configuration data
    const deviceConfigEntities = await tableService.QueryEntities(
      "deviceConfig",
      new AzureStorage.TableQuery().where("PartitionKey eq ?", tenantName)
    );

    const deviceConfigRecords = deviceConfigEntities.map(
      (deviceConfigEntity): object => {
        return {
          id: deviceConfigEntity.RowKey,
          setPointHeat: deviceConfigEntity.setPointHeat,
          setPointCool: deviceConfigEntity.setPointCool,
          threshold: deviceConfigEntity.threshold,
          cadence: deviceConfigEntity.cadence,
          allowedActions: deviceConfigEntity.allowedActions,
        };
      }
    );

    // Return success response
    return {
      // Provide a compacted rendering of the JSON in the response (by default it's pretty)
      body: JSON.stringify(deviceConfigRecords, undefined, 0),

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
