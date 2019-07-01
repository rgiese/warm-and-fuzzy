import { CustomAuthorizerHandler } from "aws-lambda";

import * as JsonWebToken from "jsonwebtoken";
import * as JsonWebKeySet from "jwks-rsa";

class Jwks {
  private static jsonWebKeyClient = JsonWebKeySet({
    jwksUri: process.env.AUTH_JWKS_URI,
    strictSsl: true,
    cache: true,
  });

  public static getSigningKey(kid: any): Promise<string> {
    return new Promise((resolve, reject) => {
      Jwks.jsonWebKeyClient.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        }

        resolve(key.publicKey || key.rsaPublicKey);
      });
    });
  }
}

export const authorize: CustomAuthorizerHandler = async event => {
  try {
    // Retrieve access token from request headers
    if (!event.authorizationToken) {
      return Promise.reject("Unauthorized");
    }

    const tokenParts = event.authorizationToken.split(" ");
    const bearerToken = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === "bearer" && bearerToken)) {
      return Promise.reject("Unauthorized");
    }

    // Decode access token to retrieve key id
    const decodedToken: any = JsonWebToken.decode(bearerToken, { complete: true });

    // Retrieve public key
    const signingKey = await Jwks.getSigningKey(decodedToken.header.kid);

    // Verify access token
    const verifiedToken = (await JsonWebToken.verify(bearerToken, signingKey, {
      audience: process.env.AUTH_AUDIENCE,
      issuer: process.env.AUTH_TOKEN_ISSUER,
      algorithms: ["RS256"],
    })) as any;

    // Return policy
    return {
      principalId: verifiedToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.methodArn,
          },
        ],
      },
    };
  } catch (err) {
    console.log(err);
    return Promise.reject("Unauthorized");
  }
};
