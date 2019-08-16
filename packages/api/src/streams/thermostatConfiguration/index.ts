import { DynamoDBStreamHandler } from "aws-lambda";
import AWS from "aws-sdk";
import "source-map-support/register";

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
    const particleAPIKey = await getParticleAPIKey();
    console.log(`API key: ${particleAPIKey}`);

    event.Records.forEach(record => {
      console.log(record.eventID);
      console.log(record.eventName);
      console.log("DynamoDB Record: %j", record.dynamodb);
    });
  } catch (error) {
    console.log(error);
    callback(error);
    return;
  }
};
