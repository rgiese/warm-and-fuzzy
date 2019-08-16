import { DynamoDBStreamHandler } from "aws-lambda";
import AWS from "aws-sdk";
import "source-map-support/register";

import { ThermostatConfiguration } from "../../shared/db";
import * as ThermostatConfigurationAdapter from "../../shared/firmware/thermostatConfigurationAdapter";

import unmarshall from "../unmarshall";
import shallowEqual from "../shallowEqual";

const SSM = new AWS.SSM();

async function getParticleAPIKey(): Promise<string> {
  const keyName = process.env.PARTICLE_API_KEY_NAME;

  if (!keyName) {
    throw new Error("Configuration error: Particle API key name not provided.");
  }

  const response = await SSM.getParameter({ Name: keyName, WithDecryption: true }).promise();

  if (!response.Parameter || !response.Parameter.Value) {
    console.log(response);
    throw new Error("Configuration error: could not decrypt Particle API key.");
  }

  return response.Parameter.Value;
}

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

    let updatesMap = new Map<string, ThermostatConfigurationAdapter.FirmwareConfiguration>();

    event.Records.forEach((record): void => {
      if (record.eventName != "MODIFY") {
        // Only interested in updates
        return;
      }

      if (!record.dynamodb || !record.dynamodb.OldImage || !record.dynamodb.NewImage) {
        return;
      }

      // Unmarshall
      const oldRecord = unmarshall(new ThermostatConfiguration(), record.dynamodb.OldImage);
      const newRecord = unmarshall(new ThermostatConfiguration(), record.dynamodb.NewImage);

      // Convert to firmware representation (a subset of what's in the full config record)
      const oldFirmwareConfig = ThermostatConfigurationAdapter.firmwareFromModel(oldRecord);
      const newFirmwareConfig = ThermostatConfigurationAdapter.firmwareFromModel(newRecord);

      // Record updates that need delivering
      if (!shallowEqual(oldFirmwareConfig, newFirmwareConfig)) {
        updatesMap.set(newRecord.id, newFirmwareConfig);
      } else {
        console.log(`Ignoring immaterial update for device ${newRecord.id}`);
      }
    });

    if (!updatesMap.size) {
        return;
    }
    
    //
    // Deliver updates
    //

    const particleAPIKey = await getParticleAPIKey();

    for (const [deviceId, firmwareConfiguration] of updatesMap) {
      console.log(`Delivering to device ${deviceId}: ${firmwareConfiguration} using key ${particleAPIKey}`);
    }
  } catch (error) {
    console.log(error);
    callback(error);
    return;
  }
};
