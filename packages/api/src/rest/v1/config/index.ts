import "source-map-support/register";

import * as GraphQL from "../../../../generated/graphqlTypes";
import * as yup from "yup";

import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import {
  Authorization,
  SensorConfigurationSchema,
  ThermostatConfigurationSchema,
  ThermostatSettingsSchema,
} from "@grumpycorp/warm-and-fuzzy-shared";
import {
  DbMapper,
  DeviceTenancy,
  SensorConfiguration,
  ThermostatConfiguration,
  ThermostatSettings,
} from "../../../shared/db";

import Authorizations from "../../../auth/Authorizations";
import Responses from "../../../shared/Responses";
import SensorConfigurationMapper from "../../../graphql/mappers/SensorConfigurationMapper";
import ThermostatConfigurationMapper from "../../../graphql/mappers/ThermostatConfigurationMapper";
import ThermostatSettingsMapper from "../../../graphql/mappers/ThermostatSettingsMapper";

//
// This API provides a cross-tenant DB import/export service.
//
// Even though it's a REST API, we'll use the GraphQL representations of our model types
// whenever available since that's what our schemas are built to validate.
//

const deviceTenancySchema = yup.object().shape({
  id: yup.string().required(),
  tenant: yup.string().required(),
});

const sensorConfigurationMapper = new SensorConfigurationMapper();
const thermostatConfigurationMapper = new ThermostatConfigurationMapper();
const thermostatSettingsMapper = new ThermostatSettingsMapper();

class SystemConfiguration {
  public deviceTenancy: DeviceTenancy[] = [];
  public sensorConfigurations: GraphQL.SensorConfiguration[] = [];
  public thermostatConfigurations: GraphQL.ThermostatConfiguration[] = [];
  public thermostatSettings: GraphQL.ThermostatSettings[] = [];
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
  const systemConfiguration = new SystemConfiguration();
  {
    for await (const item of DbMapper.scan(DeviceTenancy)) {
      systemConfiguration.deviceTenancy.push(item);
    }

    for await (const item of DbMapper.scan(SensorConfiguration)) {
      systemConfiguration.sensorConfigurations.push(
        sensorConfigurationMapper.graphqlFromModel(item)
      );
    }

    for await (const item of DbMapper.scan(ThermostatConfiguration)) {
      systemConfiguration.thermostatConfigurations.push(
        thermostatConfigurationMapper.graphqlFromModel(item)
      );
    }

    for await (const item of DbMapper.scan(ThermostatSettings)) {
      systemConfiguration.thermostatSettings.push(thermostatSettingsMapper.graphqlFromModel(item));
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

  const systemConfiguration = JSON.parse(event.body) as SystemConfiguration;
  {
    if (
      !systemConfiguration.deviceTenancy ||
      !systemConfiguration.sensorConfigurations ||
      !systemConfiguration.thermostatConfigurations ||
      !systemConfiguration.thermostatSettings
    ) {
      return Responses.badRequest("Malformed body.");
    }

    systemConfiguration.deviceTenancy.forEach((item): void => {
      deviceTenancySchema.validateSync(item);
    });

    systemConfiguration.sensorConfigurations.forEach((item): void => {
      SensorConfigurationSchema.Schema.validateSync(item);
    });

    systemConfiguration.thermostatConfigurations.forEach((item): void => {
      ThermostatConfigurationSchema.Schema.validateSync(item);
    });

    systemConfiguration.thermostatSettings.forEach((item): void => {
      ThermostatSettingsSchema.Schema.validateSync(item);
    });
  }

  // Merge in provided configuration
  const deviceTenancy = systemConfiguration.deviceTenancy.map(
    (d): DeviceTenancy => Object.assign(new DeviceTenancy(), d)
  );

  const sensorConfigurations = systemConfiguration.sensorConfigurations.map(
    (s): SensorConfiguration => sensorConfigurationMapper.modelFromGraphql(s.tenant, s)
  );

  const thermostatConfigurations = systemConfiguration.thermostatConfigurations.map(
    (t): ThermostatConfiguration => thermostatConfigurationMapper.modelFromGraphql(t.tenant, t)
  );

  const thermostatSettings = systemConfiguration.thermostatSettings.map(
    (t): ThermostatSettings => thermostatSettingsMapper.modelFromGraphql(t.tenant, t)
  );

  for await (const {} of DbMapper.batchPut(deviceTenancy)) {
  }

  for await (const {} of DbMapper.batchPut(sensorConfigurations)) {
  }

  for await (const {} of DbMapper.batchPut(thermostatConfigurations)) {
  }

  for await (const {} of DbMapper.batchPut(thermostatSettings)) {
  }

  return Responses.success({ ok: true });
};
