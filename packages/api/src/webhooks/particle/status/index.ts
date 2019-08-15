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

  // Store latest thermostat value (ignoring out-of-order delivery)
  const reportedThermostatValues = statusEvent.data.v.filter((value): boolean => !value.id);

  if (!reportedThermostatValues) {
    return Responses.badRequest({
      error: "Missing onboard sensor values",
      body: parsedRequestBody,
    });
  }

  {
    const thermostatData: ThermostatValue = {
      tenant: tenant,
      id: statusEvent.deviceId,

      publishedTime: statusEvent.publishedAt,
      deviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
      deviceLocalSerial: statusEvent.data.ser,

      currentActions: ActionsAdapter.modelFromFirmware(statusEvent.data.ca),

      temperature: reportedThermostatValues[0].t,
      humidity: reportedThermostatValues[0].h || 0,

      // TEMPORARY: See Issue #53, this should have been reported from the device.
      setPointHeat: thermostatConfiguration.setPointHeat,
      setPointCool: thermostatConfiguration.setPointCool,
      threshold: thermostatConfiguration.threshold,
    };

    const thermostatModel = Object.assign(new ThermostatValue(), thermostatData);
    await DbMapper.put(thermostatModel);
  }

  // Store latest sensor values (ignoring out-of-order delivery)
  const reportedSensorValues = statusEvent.data.v.filter((value): boolean => !!value.id);

  if (reportedSensorValues) {
    const sensorValueModels = reportedSensorValues.map(
      (value): SensorValue => {
        if (!value.id) {
          throw new Error("Internal error: sensor values not filtered correctly");
        }

        const sensorData: SensorValue = {
          tenant: tenant,
          id: value.id,

          publishedTime: statusEvent.publishedAt,
          deviceTime: new Date(statusEvent.data.ts * 1000), // .ts is in UTC epoch seconds
          deviceLocalSerial: statusEvent.data.ser,

          temperature: value.t,
        };

        return Object.assign(new SensorValue(), sensorData);
      }
    );

    for await (const {} of DbMapper.batchPut(sensorValueModels)) {
    }
  }

  return Responses.success({
    sh: thermostatConfiguration.setPointHeat,
    sc: thermostatConfiguration.setPointCool,
    th: thermostatConfiguration.threshold,
    ca: thermostatConfiguration.cadence,
    aa: ActionsAdapter.firmwareFromModel(thermostatConfiguration.allowedActions),
  });
};
