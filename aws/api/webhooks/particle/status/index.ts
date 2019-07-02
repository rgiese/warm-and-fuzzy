import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import Responses from "../../../common/Responses";

import DbMapper from "../../../types/db/DbMapper";

import DeviceTenancy from "../../../types/db/DeviceTenancy";
import LatestAction from "../../../types/db/LatestAction";
import LatestValue from "../../../types/db/LatestValue";
import ThermostatConfiguration from "../../../types/db/ThermostatConfiguration";

import { StatusEvent } from "./statusEvent";

export const post: APIGatewayProxyHandler = async event => {
  // Parse incoming status data
  const requestBody = event.body;

  if (!requestBody) {
    return Responses.badRequest("Missing request body");
  }

  const parsedRequestBody = JSON.parse(requestBody);

  let statusEvent: StatusEvent;

  try {
    statusEvent = new StatusEvent(parsedRequestBody);
  } catch (e) {
    return Responses.badRequest({ badRequestItem: e.message, body: parsedRequestBody });
  }

  // Locate tenant name for device
  let tenant: string;
  try {
    const deviceTenancy = await DbMapper.get(
      Object.assign(new DeviceTenancy(), { deviceId: statusEvent.deviceId })
    );
    tenant = deviceTenancy.tenant;
  } catch (e) {
    return Responses.badRequest({ unrecognizedDeviceId: statusEvent.deviceId });
  }

  // Store latest values (ignoring out-of-order delivery)
  {
    const latestValues = statusEvent.data.v.map(
      (value): LatestValue => {
        return Object.assign(new LatestValue(), {
          tenant: tenant,
          deviceId: value.id || statusEvent.deviceId,
          publishedTime: statusEvent.publishedAt,
          deviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
          deviceLocalSerial: statusEvent.data.ser,
          temperature: value.t,
          humidity: value.h || 0,
        });
      }
    );

    for await (const {} of DbMapper.batchPut(latestValues)) {
    }
  }

  // Store latest actions
  {
    const latestAction = Object.assign(new LatestAction(), {
      tenant: tenant,
      deviceId: statusEvent.deviceId,
      publishedTime: statusEvent.publishedAt,
      deviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
      deviceLocalSerial: statusEvent.data.ser,
      currentActions: statusEvent.data.ca,
    });

    await DbMapper.put(latestAction);
  }

  // Retrieve thermostat configuration data
  const thermostatConfiguration = await DbMapper.get(
    Object.assign(new ThermostatConfiguration(), { tenant: tenant, deviceId: statusEvent.deviceId })
  );

  return Responses.success({
    sh: thermostatConfiguration.setPointHeat,
    sc: thermostatConfiguration.setPointCool,
    th: thermostatConfiguration.threshold,
    ca: thermostatConfiguration.cadence,
    aa: thermostatConfiguration.allowedActions,
  });
};
