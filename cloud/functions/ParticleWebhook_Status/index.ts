import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { AzureTableStorage } from "../common/azureTableStorage";

import { StatusEvent } from "./statusEvent";

const tableService = new AzureTableStorage();

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    // Parse incoming status data
    const statusEvent = new StatusEvent(context, req.body);

    context.log("Parsed body: ", statusEvent);
    statusEvent.data.v.map(x => context.log(x));

    // Retrieve device configuration data
    const deviceConfiguration = await tableService.TryRetrieveEntity(
      "deviceConfig",
      "default",
      statusEvent.device_id
    );
    context.log("From table: ", deviceConfiguration);

    // Return success response
    return {
      // Provide a compacted rendering of the JSON in the response (by default it's pretty)
      body: JSON.stringify({ foo: "bar" }, undefined, 0),

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
};

export default httpTrigger;
