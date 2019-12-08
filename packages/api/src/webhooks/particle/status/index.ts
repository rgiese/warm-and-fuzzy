import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import moment from "moment";
import "source-map-support/register";

import Responses from "../../../shared/Responses";
import * as ActionsAdapter from "../../../shared/firmware/actionsAdapter";
import * as ThermostatConfigurationAdapter from "../../../shared/firmware/thermostatConfigurationAdapter";

import {
  DbMapper,
  DeviceTenancy,
  SensorConfiguration,
  SensorValue,
  SensorValueStream,
  ThermostatConfiguration,
  ThermostatValue,
  ThermostatValueStream,
} from "../../../shared/db";

import { StatusEvent, StatusEventSchema } from "./statusEvent";

//
// Support functions
//

var deviceTenancyCache = new Map();

async function getTenant(id: string): Promise<string> {
  // Tenancy values should be immutable so we can just cache them without any invalidation
  let tenant = deviceTenancyCache.get(id);

  if (!tenant) {
    const deviceTenancyCondition: Pick<DeviceTenancy, "id"> = { id };

    const deviceTenancy = await DbMapper.get(
      Object.assign(new DeviceTenancy(), deviceTenancyCondition)
    );

    tenant = deviceTenancy.tenant;
    deviceTenancyCache.set(id, tenant);
  }

  return tenant;
}

async function getThermostatConfiguration(
  tenant: string,
  id: string
): Promise<ThermostatConfiguration> {
  const thermostatConfigurationCondition: Pick<ThermostatConfiguration, "tenant" | "id"> = {
    tenant,
    id,
  };

  const thermostatConfiguration = await DbMapper.get(
    Object.assign(new ThermostatConfiguration(), thermostatConfigurationCondition)
  );

  return thermostatConfiguration;
}

async function getSensorConfigurations(
  tenant: string,
  ids: string[]
): Promise<Map<string, SensorConfiguration>> {
  const sensorConfigurationConditions = ids.map(
    (id): SensorConfiguration => {
      const sensorConfigurationCondition: Pick<SensorConfiguration, "tenant" | "id"> = {
        tenant,
        id,
      };

      return Object.assign(new SensorConfiguration(), sensorConfigurationCondition);
    }
  );

  let sensorConfigurations = new Map<string, SensorConfiguration>();

  for await (const sensorConfiguration of DbMapper.batchGet(sensorConfigurationConditions)) {
    sensorConfigurations.set(sensorConfiguration.id, sensorConfiguration);
  }

  return sensorConfigurations;
}

//
// Web hook handler
//

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
  let tenant: string;

  try {
    tenant = await getTenant(statusEvent.deviceId);
  } catch (e) {
    return Responses.badRequest({ unrecognizedDeviceId: statusEvent.deviceId });
  }

  // Retrieve configuration data
  const thermostatConfiguration = await getThermostatConfiguration(tenant, statusEvent.deviceId);

  const sensorConfigurations = await getSensorConfigurations(
    tenant,
    statusEvent.data.v.map((value): string => value.id)
  );

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

  // Prepare data to store
  const entitiesToStore = new Array<any>();

  {
    // Thermostat value (latest)
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

    entitiesToStore.push(Object.assign(new ThermostatValue(), thermostatData));
  }

  {
    // Thermostat value stream
    const thermostatStreamData: ThermostatValueStream = {
      stream: ThermostatValueStream.getStreamKey(tenant, thermostatConfiguration.streamName),
      ts: deviceTime.getTime(),

      publishedTime,
      deviceLocalSerial,

      currentActions: ActionsAdapter.modelFromFirmware(statusEvent.data.ca),

      temperature: statusEvent.data.t,
      humidity: statusEvent.data.h,

      ...ThermostatConfigurationAdapter.partialModelFromFirmware(statusEvent.data.cc),
    };

    entitiesToStore.push(Object.assign(new ThermostatValueStream(), thermostatStreamData));
  }

  statusEvent.data.v.forEach((value): void => {
    // Sensor values (latest)
    {
      const sensorData: SensorValue = {
        tenant: tenant,
        id: value.id,

        publishedTime,
        deviceTime,
        deviceLocalSerial,

        temperature: value.t,
      };

      entitiesToStore.push(Object.assign(new SensorValue(), sensorData));
    }

    // Sensor value streams
    const sensorConfiguration = sensorConfigurations.get(value.id);

    if (sensorConfiguration) {
      const sensorStreamData: SensorValueStream = {
        stream: SensorValueStream.getStreamKey(tenant, sensorConfiguration.streamName),
        ts: deviceTime.getTime(),

        publishedTime,
        deviceLocalSerial,

        temperature: value.t,
      };

      entitiesToStore.push(Object.assign(new SensorValueStream(), sensorStreamData));
    }
  });

  // Commmit values
  for await (const {} of DbMapper.batchPut(entitiesToStore)) {
  }

  // Return current configuration to device
  return Responses.success(
    ThermostatConfigurationAdapter.firmwareFromModel(thermostatConfiguration)
  );
};
