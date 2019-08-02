import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";

import Responses from "../../../shared/Responses";

import {
  DbMapper,
  DeviceTenancy,
  LatestAction,
  LatestValue,
  ThermostatConfiguration,
} from "../../../shared/db";

import { StatusEvent, StatusEventSchema } from "./statusEvent";
import * as ActionsAdapter from "./actionsAdapter";

var deviceTenancyCache = new Map();

export const post: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  // Parse incoming status data
  const requestBody = event.body;

  if (!requestBody) {
    return Responses.badRequest("Missing request body");
  }

  const parsedRequestBody = JSON.parse(requestBody);

  let statusEvent: StatusEvent;

  try {
    statusEvent = await StatusEventSchema.validate(parsedRequestBody, { stripUnknown: true });
  } catch (e) {
    return Responses.badRequest({ error: e.errors, body: parsedRequestBody });
  }

  // Locate tenant name for device
  // - these values should be immutable so we can just cache them without any invalidation
  let tenant = deviceTenancyCache.get(statusEvent.deviceId);

  if (!tenant) {
    try {
      const deviceTenancy = await DbMapper.get(
        Object.assign(new DeviceTenancy(), { deviceId: statusEvent.deviceId })
      );

      tenant = deviceTenancy.tenant;
      deviceTenancyCache.set(statusEvent.deviceId, tenant);
    } catch (e) {
      return Responses.badRequest({ unrecognizedDeviceId: statusEvent.deviceId });
    }
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
      currentActions: ActionsAdapter.modelFromFirmware(statusEvent.data.ca),
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
    aa: ActionsAdapter.firmwareFromModel(thermostatConfiguration.allowedActions),
  });
};
