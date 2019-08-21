import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as yup from "yup";
import "source-map-support/register";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";

import Authorizations from "../../../auth/Authorizations";
import Responses from "../../../shared/Responses";

import { DbMapper, SensorValueStream, ThermostatValueStream } from "../../../shared/db";

import RestSensorValueStream from "./RestSensorValueStream";
import RestThermostatValueStream from "./RestThermostatValueStream";

enum StreamType {
  Sensor = "sensor",
  Thermostat = "thermostat",
}

const QueryParametersSchema = yup.object().shape({
  stream: yup.string().required(),
  type: yup
    .string()
    .required()
    .oneOf([StreamType.Sensor, StreamType.Thermostat]),
});

//
// Helpers
//

async function getSensorValueStream(
  tenant: string,
  streamName: string
): Promise<RestSensorValueStream[]> {
  const streamKey = SensorValueStream.getStreamKey(tenant, streamName);
  const itemCondition: Pick<SensorValueStream, "stream"> = { stream: streamKey };

  const values = new Array<RestSensorValueStream>();

  for await (const item of DbMapper.query(ThermostatValueStream, itemCondition)) {
    const { ...remainder } = item;

    values.push({
      ...remainder,
      ts: new Date(item.ts),
    });
  }

  return values;
}

async function getThermostatValueStream(
  tenant: string,
  streamName: string
): Promise<RestThermostatValueStream[]> {
  const streamKey = ThermostatValueStream.getStreamKey(tenant, streamName);
  const itemCondition: Pick<ThermostatValueStream, "stream"> = { stream: streamKey };

  const values = new Array<RestThermostatValueStream>();

  for await (const item of DbMapper.query(ThermostatValueStream, itemCondition)) {
    const { currentActions, allowedActions, ...remainder } = item;

    values.push({
      ...remainder,
      ts: new Date(item.ts),
      currentActions: currentActions ? Array.from(currentActions) : [],
      allowedActions: allowedActions ? Array.from(allowedActions) : [],
    });
  }

  return values;
}

//
// GET handler
//

export const get: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  // Authorize
  const authorizations = new Authorizations(event);

  if (
    !authorizations.AuthorizedTenant ||
    !authorizations.HasPermission(Authorization.Permissions.ReadData)
  ) {
    return Responses.noTenantOrPermissions();
  }

  const tenant = authorizations.AuthorizedTenant;

  // Parse query parameters
  let queryParameters: yup.InferType<typeof QueryParametersSchema>;

  try {
    queryParameters = await QueryParametersSchema.validate(event.queryStringParameters, {
      stripUnknown: true,
    });
  } catch (e) {
    return Responses.badRequest({
      error: e.errors,
      queryStringParameters: event.queryStringParameters,
    });
  }

  const streamName = queryParameters.stream;
  const streamType =
    queryParameters.type === StreamType.Sensor ? StreamType.Sensor : StreamType.Thermostat;

  // Retrieve data
  const streamData: any[] =
    streamType === StreamType.Sensor
      ? await getSensorValueStream(tenant, streamName)
      : await getThermostatValueStream(tenant, streamName);

  // Return data
  return Responses.success(streamData);
};
