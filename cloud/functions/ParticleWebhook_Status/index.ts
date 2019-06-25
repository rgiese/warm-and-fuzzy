import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import { AzureTableStorage, TableInsertStrategy } from "../common/azureTableStorage";

import { DeviceConfiguration } from "../schema/deviceConfiguration";
import { DeviceToTenant } from "../schema/deviceToTenant";
import { LatestActions } from "../schema/latestActions";
import { LatestValues } from "../schema/latestValues";

import { StatusEvent } from "./statusEvent";

const tableService = new AzureTableStorage();

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<any> {
  try {
    // Parse incoming status data
    const statusEvent = new StatusEvent(context, req.body);
    const deviceId = statusEvent.deviceId.toLowerCase();

    // Locate tenant name for device
    const deviceToTenant = await tableService.TryRetrieveEntity(
      "deviceToTenant",
      "default",
      deviceId,
      DeviceToTenant
    );

    // Store latest values (ignoring out-of-order delivery)
    {
      const latestValues = statusEvent.data.v.map(
        (value): LatestValues => {
          return Object.assign(new LatestValues(), {
            tenant: deviceToTenant.tenant,
            deviceId: (value.id || deviceId).toLowerCase(),
            publishedTime: statusEvent.publishedAt,
            deviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
            deviceLocalSerial: statusEvent.data.ser,
            temperature: value.t,
            humidity: value.h || 0,
          });
        }
      );

      await tableService.InsertEntities(
        "latestValues",
        latestValues,
        TableInsertStrategy.InsertOrReplace
      );
    }

    // Store latest actions
    {
      const latestActions = Object.assign(new LatestActions(), {
        tenant: deviceToTenant.tenant,
        deviceId: deviceId,
        publishedTime: statusEvent.publishedAt,
        deviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
        deviceLocalSerial: statusEvent.data.ser,
        currentActions: statusEvent.data.ca,
      });

      await tableService.InsertEntities(
        "latestActions",
        [latestActions],
        TableInsertStrategy.InsertOrReplace
      );
    }

    // Retrieve device configuration data
    const deviceConfiguration = await tableService.TryRetrieveEntity(
      "deviceConfig",
      deviceToTenant.tenant,
      deviceId,
      DeviceConfiguration
    );

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
        message: error.message,
      },
    };
  }
};

export default httpTrigger;
