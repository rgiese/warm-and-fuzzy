import "source-map-support/register";

import * as ThermostatConfigurationAdapter from "../../shared/firmware/thermostatConfigurationAdapter";

import {
  DbMapper,
  DeviceWithTenantAndId,
  ThermostatConfiguration,
  ThermostatSettings,
} from "../../shared/db";
import { getParticleAPIKey, invokeParticleFunction } from "../invokeParticleFunction";

import { DynamoDBStreamHandler } from "aws-lambda";
import unmarshall from "../unmarshall";

//
// This function is called for changes to both the ThermostatConfiguration and ThermostatSettings tables
// and is designed to be able to fish out the devices identifier from either table.
//

export const dynamoStream: DynamoDBStreamHandler = async (
  event,
  _context,
  callback
): Promise<void> => {
  try {
    //
    // Determine identifiers of affected devices from database change
    //

    const affectedDevices = new Array<DeviceWithTenantAndId>();

    event.Records.forEach((record): void => {
      if (record.eventName != "MODIFY") {
        // Only interested in updates
        return;
      }

      if (!record.dynamodb || !record.dynamodb.NewImage) {
        console.log(`Unexpected: record is incomplete`);
        console.log(record);
        return;
      }

      const deviceIdentifier = unmarshall(new DeviceWithTenantAndId(), record.dynamodb.NewImage);

      if (!deviceIdentifier.tenant || !deviceIdentifier.id) {
        console.log(`Unexpected: no tenant or id found`);
        console.log(record);
      }

      affectedDevices.push(deviceIdentifier);
    });

    if (!affectedDevices.length) {
      console.log(`No affected devices found.`);
    }

    //
    // Build and deliver configurations for affected devices
    //

    const particleAPIKey = await getParticleAPIKey();

    for await (const deviceIdentifier of affectedDevices) {
      // Retrieve thermostat configuration
      let thermostatConfiguration: ThermostatConfiguration | undefined = undefined;

      try {
        thermostatConfiguration = await DbMapper.getOne(new ThermostatConfiguration(), {
          tenant: deviceIdentifier.tenant,
          id: deviceIdentifier.id,
        });
      } catch (error) {
        console.log(`Error retrieving configuration for device ${deviceIdentifier.id}, skipping.`);
        console.log(error);
        continue;
      }

      // Retrieve thermostat settings
      let thermostatSettings: ThermostatSettings | undefined = undefined;

      try {
        thermostatSettings = await DbMapper.getOne(new ThermostatSettings(), {
          tenant: deviceIdentifier.tenant,
          id: deviceIdentifier.id,
        });
      } catch (error) {
        console.log(`Error retrieving settings for device ${deviceIdentifier.id}, skipping.`);
        console.log(error);
        continue;
      }

      // Build firmware configuration
      const firmwareConfiguration = ThermostatConfigurationAdapter.firmwareFromModel(
        thermostatConfiguration,
        thermostatSettings
      );

      console.log(
        `Delivering updated configuration to device ${deviceIdentifier.id}: ${firmwareConfiguration}`
      );

      try {
        // see /firmware/thermostat/Main.cpp#setup() > Particle.function()
        await invokeParticleFunction(
          particleAPIKey,
          "configPush",
          deviceIdentifier.id,
          firmwareConfiguration
        );
      } catch (error) {
        console.log(`Error delivering notification (see below), ignoring.`);
        console.log(error);
        continue;
      }
    }
  } catch (error) {
    console.log(error);
    callback(error);
    return;
  }
};
