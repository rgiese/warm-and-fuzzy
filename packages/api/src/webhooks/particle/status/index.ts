import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";

import Responses from "../../../shared/Responses";

import {
  DbMapper,
  DeviceTenancy,
  SensorValue,
  ThermostatValue,
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
      const deviceTenancyCondition: Pick<DeviceTenancy, "id"> = { id: statusEvent.deviceId };

      const deviceTenancy = await DbMapper.get(
        Object.assign(new DeviceTenancy(), deviceTenancyCondition)
      );

      tenant = deviceTenancy.tenant;
      deviceTenancyCache.set(statusEvent.deviceId, tenant);
    } catch (e) {
      return Responses.badRequest({ unrecognizedDeviceId: statusEvent.deviceId });
    }
  }

  // Retrieve thermostat configuration data
  const thermostatConfigurationCondition: Pick<ThermostatConfiguration, "tenant" | "id"> = {
    tenant: tenant,
    id: statusEvent.deviceId,
  };

  const thermostatConfiguration = await DbMapper.get(
    Object.assign(new ThermostatConfiguration(), thermostatConfigurationCondition)
  );

  // Store latest sensor values (ignoring out-of-order delivery)
  const reportedSensorValues = statusEvent.data.v.filter((value): boolean => !!value.id);

  if (reportedSensorValues) {
    const sensorValueModels = reportedSensorValues.map(
      (value): SensorValue => {
        if (!value.id) {
          throw new Error("Internal error: sensor values not filtered correctly");
        }

        let v = new SensorValue();

        v.tenant = tenant;
        v.id = value.id;

        v.publishedTime = statusEvent.publishedAt;
        v.deviceTime = new Date(statusEvent.data.ts * 1000); // .ts is in UTC epoch seconds
        v.deviceLocalSerial = statusEvent.data.ser;

        v.temperature = value.t;
        v.humidity = value.h || 0;

        return v;
      }
    );

    for await (const {} of DbMapper.batchPut(sensorValueModels)) {
    }
  }

  // Store latest thermostat value
  const reportedThermostatValues = statusEvent.data.v.filter((value): boolean => !value.id);

  if (reportedThermostatValues) {
    const reportedThermostatValue = reportedThermostatValues[0];

    let latestThermostatValue = new ThermostatValue();

    latestThermostatValue.tenant = tenant;
    latestThermostatValue.id = statusEvent.deviceId;

    latestThermostatValue.publishedTime = statusEvent.publishedAt;
    latestThermostatValue.deviceTime = new Date(statusEvent.data.ts * 1000); // .ts is in UTC epoch seconds
    latestThermostatValue.deviceLocalSerial = statusEvent.data.ser;

    latestThermostatValue.currentActions = ActionsAdapter.modelFromFirmware(statusEvent.data.ca);

    latestThermostatValue.temperature = reportedThermostatValue.t;
    latestThermostatValue.humidity = reportedThermostatValue.h || 0;

    // TEMPORARY: See Issue #53; this should have been reported from the device.
    latestThermostatValue.setPointHeat = thermostatConfiguration.setPointHeat;
    latestThermostatValue.setPointCool = thermostatConfiguration.setPointCool;
    latestThermostatValue.threshold = thermostatConfiguration.threshold;

    await DbMapper.put(latestThermostatValue);
  }

  return Responses.success({
    sh: thermostatConfiguration.setPointHeat,
    sc: thermostatConfiguration.setPointCool,
    th: thermostatConfiguration.threshold,
    ca: thermostatConfiguration.cadence,
    aa: ActionsAdapter.firmwareFromModel(thermostatConfiguration.allowedActions),
  });
};
