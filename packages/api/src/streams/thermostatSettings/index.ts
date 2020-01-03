import { DynamoDBStreamHandler } from "aws-lambda";
import "source-map-support/register";

import { DbMapper, ThermostatConfiguration, ThermostatSettings } from "../../shared/db";
import * as ThermostatConfigurationAdapter from "../../shared/firmware/thermostatConfigurationAdapter";

import { getParticleAPIKey, invokeParticleFunction } from "../invokeParticleFunction";
import unmarshall from "../unmarshall";

export const dynamoStream: DynamoDBStreamHandler = async (
  event,
  _context,
  callback
): Promise<void> => {
  try {
    //
    // Accumulate updates to deliver
    // - accumulate in a map so multiple updates to a single device don't result in multiple deliveries
    //

    const updatesMap = new Map<string, string>();

    event.Records.forEach(
      async (record): Promise<void> => {
        if (record.eventName != "MODIFY") {
          // Only interested in updates
          return;
        }

        if (!record.dynamodb || !record.dynamodb.OldImage || !record.dynamodb.NewImage) {
          return;
        }

        // Unmarshall
        const oldRecord = unmarshall(new ThermostatSettings(), record.dynamodb.OldImage);
        const newRecord = unmarshall(new ThermostatSettings(), record.dynamodb.NewImage);

        // Retrieve thermostat configuration
        const thermostatConfiguration = await DbMapper.getOne(new ThermostatConfiguration(), {
          tenant: newRecord.tenant,
          id: newRecord.id,
        });

        // Convert to firmware representation (a subset of what's in the full config record)
        const oldFirmwareConfig = ThermostatConfigurationAdapter.firmwareFromModel(
          thermostatConfiguration,
          oldRecord
        );
        const newFirmwareConfig = ThermostatConfigurationAdapter.firmwareFromModel(
          thermostatConfiguration,
          newRecord
        );

        // Record updates that need delivering
        if (oldFirmwareConfig !== newFirmwareConfig) {
          updatesMap.set(newRecord.id, newFirmwareConfig);
        } else {
          console.log(`Ignoring immaterial update for device ${newRecord.id}`);
        }
      }
    );

    if (!updatesMap.size) {
      return;
    }

    //
    // Deliver updates
    //

    const particleAPIKey = await getParticleAPIKey();

    for (const [deviceId, firmwareConfiguration] of updatesMap) {
      console.log(
        `Delivering updated configuration to device ${deviceId}: ${firmwareConfiguration}`
      );

      try {
        // see /firmware/thermostat/Main.cpp#setup() > Particle.function()
        invokeParticleFunction(particleAPIKey, "configPush", deviceId, firmwareConfiguration);
      } catch (error) {
        console.log(`Error delivering notification (see below), ignoring.`);
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
    callback(error);
    return;
  }
};
