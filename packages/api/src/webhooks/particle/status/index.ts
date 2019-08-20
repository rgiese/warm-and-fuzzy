import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import moment from "moment";
import "source-map-support/register";

import Responses from "../../../shared/Responses";
import * as ActionsAdapter from "../../../shared/firmware/actionsAdapter";
import * as ThermostatConfigurationAdapter from "../../../shared/firmware/thermostatConfigurationAdapter";

import {
  DbMapper,
  DeviceTenancy,
  SensorValue,
  ThermostatValue,
  ThermostatConfiguration,
} from "../../../shared/db";

import { StatusEvent, StatusEventSchema } from "./statusEvent";

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

  // Patch up device time if it's overly out of sync with the "published" time attached by Particle Cloud
  // - this can happen when a device first boots up and hasn't performed NTP sync yet;
  //   in those cases, the device-reported time tends to be egregiously (~20 years) off.
  const publishedTime = statusEvent.publishedAt;
  const deviceLocalSerial = statusEvent.data.ser;
  const reportedDeviceTime = new Date(statusEvent.data.ts * 1000); // .ts is in UTC epoch seconds

  const deviceTimeToPublishedTimeDifference = moment.duration(
    moment(publishedTime).diff(moment(reportedDeviceTime))
  );

  const deviceTime =
    deviceTimeToPublishedTimeDifference.asMonths() < 1 ? reportedDeviceTime : publishedTime;

  // Store latest thermostat value (ignoring out-of-order delivery)
  {
    const thermostatData: ThermostatValue = {
      tenant: tenant,
      id: statusEvent.deviceId,

      publishedTime,
      deviceTime,
      deviceLocalSerial,

      currentActions: ActionsAdapter.modelFromFirmware(statusEvent.data.ca),

      temperature: statusEvent.data.t,
      humidity: statusEvent.data.h,

      ...ThermostatConfigurationAdapter.partialModelFromFirmware(statusEvent.data.cc),
    };

    const thermostatModel = Object.assign(new ThermostatValue(), thermostatData);
    await DbMapper.put(thermostatModel);
  }

  // Store latest sensor values (ignoring out-of-order delivery)
  if (statusEvent.data.v && statusEvent.data.v.length) {
    const sensorValueModels = statusEvent.data.v.map(
      (value): SensorValue => {
        if (!value.id) {
          throw new Error("Internal error: sensor values not filtered correctly");
        }

        const sensorData: SensorValue = {
          tenant: tenant,
          id: value.id,

          publishedTime,
          deviceTime,
          deviceLocalSerial,

          temperature: value.t,
        };

        return Object.assign(new SensorValue(), sensorData);
      }
    );

    for await (const {} of DbMapper.batchPut(sensorValueModels)) {
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

  return Responses.success(
    ThermostatConfigurationAdapter.firmwareFromModel(thermostatConfiguration)
  );
};
