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
        let v = new LatestValue();

        v.tenant = tenant;
        v.sensorId = value.id || statusEvent.deviceId;
        v.publishedTime = statusEvent.publishedAt;
        v.deviceTime = new Date(statusEvent.data.ts * 1000); // .ts is in UTC epoch seconds
        v.deviceLocalSerial = statusEvent.data.ser;
        v.temperature = value.t;
        v.humidity = value.h || 0;

        return v;
      }
    );

    for await (const {} of DbMapper.batchPut(latestValues)) {
    }
  }

  // Store latest actions
  {
    let latestAction = new LatestAction();

    latestAction.tenant = tenant;
    latestAction.deviceId = statusEvent.deviceId;
    latestAction.publishedTime = statusEvent.publishedAt;
    latestAction.deviceTime = new Date(statusEvent.data.ts * 1000); // .ts is in UTC epoch seconds
    latestAction.deviceLocalSerial = statusEvent.data.ser;
    latestAction.currentActions = ActionsAdapter.modelFromFirmware(statusEvent.data.ca);

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
