import { DynamoDBStreamHandler } from "aws-lambda";
import AWS from "aws-sdk";
import "source-map-support/register";

import axios from "axios";
import qs from "qs";

import { ThermostatConfiguration } from "../../shared/db";
import * as ThermostatConfigurationAdapter from "../../shared/firmware/thermostatConfigurationAdapter";

import unmarshall from "../unmarshall";

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

    const updatesMap = new Map<string, string>();

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
      if (oldFirmwareConfig !== newFirmwareConfig) {
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
      console.log(
        `Delivering updated configuration to device ${deviceId}: ${firmwareConfiguration}`
      );

      try {
        const configPushFunctionName = "configPush"; // see /firmware/thermostat/Main.cpp#setup() > Particle.function()

        const postResult = await axios.post(
          `https://api.particle.io/v1/devices/${deviceId}/${configPushFunctionName}`,
          qs.stringify({ arg: firmwareConfiguration }),
          {
            headers: {
              authorization: `Bearer ${particleAPIKey}`,
              "content-type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (postResult.status != 200) {
          console.log(postResult);
        }
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
