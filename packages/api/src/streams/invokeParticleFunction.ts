import AWS from "aws-sdk";
import axios from "axios";
import qs from "qs";

const SSM = new AWS.SSM();

export async function getParticleAPIKey(): Promise<string> {
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

export async function invokeParticleFunction(
  particleAPIKey: string,
  functionName: string,
  deviceId: string,
  arg: string
): Promise<number> {
  const postResult = await axios.post(
    `https://api.particle.io/v1/devices/${deviceId}/${functionName}`,
    qs.stringify({ arg }),
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

  return postResult.status;
}
