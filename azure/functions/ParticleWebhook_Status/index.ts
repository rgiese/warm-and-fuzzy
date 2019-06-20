import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { AzureTableStorage, TableEntity, TableInsertStrategy } from "../common/azureTableStorage";

import { DeviceConfiguration } from "./deviceConfiguration";
import { StatusEvent } from "./statusEvent";

const tableService = new AzureTableStorage();

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    // Parse incoming status data
    const statusEvent = new StatusEvent(context, req.body);

    // Store latest values (ignoring out-of-order delivery)
    {
      const latestValueEntities = statusEvent.data.v.map(
        (value): TableEntity => {
          return {
            PartitionKey: "default",
            RowKey: (value.id || statusEvent.deviceId).toLowerCase(),
            PublishedTime: statusEvent.publishedAt,
            DeviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
            DeviceLocalSerial: statusEvent.data.ser,
            Temperature: value.t,
            Humidity: value.h,
          };
        }
      );

      await tableService.InsertEntities(
        "latestValues",
        latestValueEntities,
        TableInsertStrategy.InsertOrReplace
      );
    }

    // Store latest actions
    {
      const latestActionsEntities = [
        {
          PartitionKey: "default",
          RowKey: statusEvent.deviceId.toLowerCase(),
          PublishedTime: statusEvent.publishedAt,
          DeviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
          DeviceLocalSerial: statusEvent.data.ser,
          CurrentActions: statusEvent.data.ca,
        },
      ];

      await tableService.InsertEntities(
        "latestActions",
        latestActionsEntities,
        TableInsertStrategy.InsertOrReplace
      );
    }

    // Retrieve device configuration data
    const deviceConfigurationJson = await tableService.TryRetrieveEntity(
      "deviceConfig",
      "default",
      statusEvent.deviceId
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
};

export default httpTrigger;