import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { between } from "@aws/dynamodb-expressions";
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
  // Required parameters
  stream: yup.string().required(),
  type: yup
    .string()
    .required()
    .oneOf([StreamType.Sensor, StreamType.Thermostat]),
  // Optional parameters
  startDate: yup.date().default(new Date(0 /* beginning of time */)),
  endDate: yup.date().default(new Date(/* now */)),
});

//
// Helpers
//

async function getSensorValueStream(
  tenant: string,
  streamName: string,
  startDate: Date,
  endDate: Date
): Promise<RestSensorValueStream[]> {
  const values = new Array<RestSensorValueStream>();

  for await (const item of DbMapper.query(ThermostatValueStream, {
    stream: SensorValueStream.getStreamKey(tenant, streamName),
    ts: between(startDate.getTime(), endDate.getTime()),
  })) {
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
  streamName: string,
  startDate: Date,
  endDate: Date
): Promise<RestThermostatValueStream[]> {
  const values = new Array<RestThermostatValueStream>();

  for await (const item of DbMapper.query(ThermostatValueStream, {
    stream: ThermostatValueStream.getStreamKey(tenant, streamName),
    ts: between(startDate.getTime(), endDate.getTime()),
  })) {
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

  // Retrieve data
  const streamData: any[] =
    queryParameters.type === StreamType.Sensor
      ? await getSensorValueStream(
          tenant,
          queryParameters.stream,
          queryParameters.startDate,
          queryParameters.endDate
        )
      : await getThermostatValueStream(
          tenant,
          queryParameters.stream,
          queryParameters.startDate,
          queryParameters.endDate
        );

  // Return data
  return Responses.success(streamData);
};
