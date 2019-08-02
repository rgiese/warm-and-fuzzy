import { CustomAuthorizerHandler } from "aws-lambda";

import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

import * as JsonWebToken from "jsonwebtoken";
import * as JsonWebKeySet from "jwks-rsa";

import Authorizations from "./Authorizations";

class Jwks {
  private static jsonWebKeyClient = JsonWebKeySet({
    jwksUri: `https://${AuthenticationConfiguration.Domain}/.well-known/jwks.json`,
    strictSsl: true,
    cache: true,
  });

  public static getSigningKey(kid: any): Promise<string> {
    return new Promise((resolve, reject) => {
      Jwks.jsonWebKeyClient.getSigningKey(kid, (err: any, key: any) => {
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
      audience: AuthenticationConfiguration.Audience,
      issuer: `https://${AuthenticationConfiguration.Domain}/`,
      algorithms: ["RS256"],
    })) as any;

    // Extract custom information from token
    const customClaimIds = {
      Tenant: AuthenticationConfiguration.CustomClaimsNamespace + "tenant",
    };

    const authorizations: Authorizations = {
      AuthorizedTenant: verifiedToken[customClaimIds.Tenant],
      AuthorizedPermissions: (verifiedToken.permissions as string[]).join(","),
    };

    if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
      return Promise.reject("Unauthorized");
    }

    // Build policy

    //
    // As part of the returned policy, we have to specify the ARN of what we're granting the caller access to.
    // We're helpfully given the ARN of the method this authorizer is protecting (event.methodArn);
    // however, since our response gets cached (as it should), we have to expand the ARN to include
    // all of the APIs that fall under our protection.
    //
    // We're going to give the caller access to:
    //   - all APIs (*/api/*)
    //   - our GraphQL API (*/graphql/*)
    // ...under the gateway and stage we're pointing at.
    //
    // The target (resource) ARN consists of the following '/'-separated components:
    //
    // For (e.g.) "arn:aws:execute-api:us-west-2:random-account-id:random-api-id/dev/GET/api/v1/config":
    // - Base ARN (e.g. "arn:aws:execute-api:us-west-2:random-account-id:random-api-id")
    // - Stage (e.g. "dev")
    // - Method (e.g. "GET")
    // - Endpoint path (e.g. "api/v1/config")
    //

    // Separate ARN components
    const arnComponents = event.methodArn.split("/");
    const arnBase = arnComponents.slice(0, 2).join("/"); // e.g. "arn:.../dev"

    const policy = {
      principalId: verifiedToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          // API
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: `${arnBase}/*/api/*`,
          },
          // GraphQL
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: `${arnBase}/*/graphql`,
          },
        ],
      },
      context: authorizations,
    };

    return policy;
  } catch (err) {
    console.log(err);
    return Promise.reject("Unauthorized");
  }
};
