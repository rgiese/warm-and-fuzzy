import "source-map-support/register";

import * as ActionsAdapter from "../../../shared/firmware/actionsAdapter";
import * as ThermostatConfigurationAdapter from "../../../shared/firmware/thermostatConfigurationAdapter";

import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import {
  DbMapper,
  DeviceTenancy,
  ObjectWithIdAndTenant,
  SensorConfiguration,
  SensorValue,
  SensorValueStream,
  ThermostatConfiguration,
  ThermostatSettings,
  ThermostatValue,
  ThermostatValueStream,
} from "../../../shared/db";
import { StatusEvent, StatusEventSchema } from "./statusEvent";

import Responses from "../../../shared/Responses";
import moment from "moment";

//
// Device tenancy cache
//

const deviceTenancyCache = new Map();

async function getTenant(id: string): Promise<string> {
  // Tenancy values should be immutable so we can just cache them without any invalidation
  let tenant = deviceTenancyCache.get(id);

  if (!tenant) {
    const deviceTenancy = await DbMapper.getOne(new DeviceTenancy(), { id });

    tenant = deviceTenancy.tenant;
    deviceTenancyCache.set(id, tenant);
  }

  return tenant;
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

  let statusEvent: StatusEvent | undefined = undefined;

  try {
    statusEvent = await StatusEventSchema.validate(parsedRequestBody, { stripUnknown: true });
  } catch (e) {
    return Responses.badRequest({ error: e.errors, body: parsedRequestBody });
  }

  // Locate tenant name for device
  let tenant = "";

  try {
    tenant = await getTenant(statusEvent.deviceId);
  } catch (e) {
    return Responses.badRequest({ unrecognizedDeviceId: statusEvent.deviceId });
  }

  const deviceKey: ObjectWithIdAndTenant = { tenant, id: statusEvent.deviceId };

  // Retrieve configuration data
  const thermostatConfiguration = await DbMapper.getOne(new ThermostatConfiguration(), deviceKey);
  const thermostatSettings = await DbMapper.getOne(new ThermostatSettings(), deviceKey);

  const sensorConfigurations = await DbMapper.getBatch(
    statusEvent.data.v.map(
      (value): SensorConfiguration =>
        Object.assign(new SensorConfiguration(), { tenant, id: value.id })
    )
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
    const baseThermostatData = {
      temperature: statusEvent.data.t,
      secondaryTemperature: statusEvent.data.t2,
      humidity: statusEvent.data.h,
      currentActions: ActionsAdapter.modelFromFirmware(statusEvent.data.ca),
      allowedActions: ActionsAdapter.modelFromFirmware(statusEvent.data.cc.aa),
      setPointHeat: statusEvent.data.cc.sh,
      setPointCool: statusEvent.data.cc.sc,
      setPointCirculateAbove: statusEvent.data.cc.sa,
      setPointCirculateBelow: statusEvent.data.cc.sb,
      threshold: statusEvent.data.cc.th,
      currentTimezoneUTCOffset: statusEvent.data.cc.tz,
    };

    {
      // Thermostat value (latest)
      const thermostatData: ThermostatValue = {
        ...deviceKey,

        publishedTime,
        deviceTime,
        deviceLocalSerial,

        ...baseThermostatData,
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

        ...baseThermostatData,
      };

      entitiesToStore.push(Object.assign(new ThermostatValueStream(), thermostatStreamData));
    }
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
    const sensorConfiguration = sensorConfigurations.find(
      sensorConfiguration => sensorConfiguration.id === value.id
    );

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
    ThermostatConfigurationAdapter.firmwareFromModel(thermostatConfiguration, thermostatSettings)
  );
};
