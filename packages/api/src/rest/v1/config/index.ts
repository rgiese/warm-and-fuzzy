import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as yup from "yup";
import "source-map-support/register";

import Authorizations from "../../../auth/Authorizations";

import Responses from "../../../shared/Responses";

//
// This API provides a cross-tenant DB import/export service.
//
// Even though it's a REST API, we'll use the GraphQL representations of our model types
// whenever available since that's what our schemas are built to validate.
//

import {
  DbMapper,
  DeviceTenancy,
  SensorConfiguration,
  ThermostatConfiguration,
} from "../../../shared/db";

import {
  Authorization,
  SensorConfigurationSchema,
  ThermostatConfigurationSchema,
} from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../../../generated/graphqlTypes";

import SensorConfigurationMapper from "../../../graphql/mappers/SensorConfigurationMapper";
import ThermostatConfigurationMapper from "../../../graphql/mappers/ThermostatConfigurationMapper";

const deviceTenancySchema = yup.object().shape({
  id: yup.string().required(),
  tenant: yup.string().required(),
});

const sensorConfigurationMapper = new SensorConfigurationMapper();
const thermostatConfigurationMapper = new ThermostatConfigurationMapper();

class SystemConfiguration {
  public deviceTenancy: DeviceTenancy[];
  public sensors: GraphQL.SensorConfiguration[];
  public thermostats: GraphQL.ThermostatConfiguration[];

  public constructor() {
    this.deviceTenancy = [];
    this.sensors = [];
    this.thermostats = [];
  }
}

export const get: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  // Authorize
  const authorizations = new Authorizations(event);

  if (
    !authorizations.HasPermission(Authorization.Permissions.CrossTenantAdmin) ||
    !authorizations.HasPermission(Authorization.Permissions.ReadConfig)
  ) {
    return Responses.noTenantOrPermissions();
  }

  // Get data
  let systemConfiguration = new SystemConfiguration();
  {
    for await (const item of DbMapper.scan(DeviceTenancy)) {
      systemConfiguration.deviceTenancy.push(item);
    }

    for await (const item of DbMapper.scan(SensorConfiguration)) {
      systemConfiguration.sensors.push(sensorConfigurationMapper.graphqlFromModel(item));
    }

    for await (const item of DbMapper.scan(ThermostatConfiguration)) {
      systemConfiguration.thermostats.push(thermostatConfigurationMapper.graphqlFromModel(item));
    }
  }

  return Responses.success(systemConfiguration);
};

export const put: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  // Authorize
  const authorizations = new Authorizations(event);

  if (
    !authorizations.HasPermission(Authorization.Permissions.CrossTenantAdmin) ||
    !authorizations.HasPermission(Authorization.Permissions.WriteConfig)
  ) {
    return Responses.noTenantOrPermissions();
  }

  // Validate
  if (!event.body) {
    return Responses.badRequest("Missing body.");
  }

  let systemConfiguration = JSON.parse(event.body) as SystemConfiguration;
  {
    if (
      !systemConfiguration.deviceTenancy ||
      !systemConfiguration.sensors ||
      !systemConfiguration.thermostats
    ) {
      return Responses.badRequest("Malformed body.");
    }

    systemConfiguration.deviceTenancy.forEach(
      async (item): Promise<void> => {
        await deviceTenancySchema.validate(item);
      }
    );

    systemConfiguration.sensors.forEach(
      async (item): Promise<void> => {
        await SensorConfigurationSchema.Schema.validate(item);
      }
    );

    systemConfiguration.thermostats.forEach(
      async (item): Promise<void> => {
        await ThermostatConfigurationSchema.Schema.validate(item);
      }
    );
  }

  // Merge in provided configuration
  const deviceTenancy = systemConfiguration.deviceTenancy.map(
    (d): DeviceTenancy => Object.assign(new DeviceTenancy(), d)
  );
  const sensors = systemConfiguration.sensors.map(
    (s): SensorConfiguration => sensorConfigurationMapper.modelFromGraphql(s.tenant, s)
  );
  const thermostats = systemConfiguration.thermostats.map(
    (t): ThermostatConfiguration => thermostatConfigurationMapper.modelFromGraphql(t.tenant, t)
  );

  for await (const {} of DbMapper.batchPut(deviceTenancy)) {
  }

  for await (const {} of DbMapper.batchPut(sensors)) {
  }

  for await (const {} of DbMapper.batchPut(thermostats)) {
  }

  return Responses.success({ ok: true });
};
