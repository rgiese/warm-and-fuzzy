import * as JsonWebKeySet from "jwks-rsa";
import * as JsonWebToken from "jsonwebtoken";

import { CustomAuthorizerHandler, CustomAuthorizerResult } from "aws-lambda";
import { PackPermissions, PackedAuthorizations } from "./PackedAuthorizations";

import { AuthenticationConfiguration } from "@grumpycorp/warm-and-fuzzy-shared";

const jsonWebKeyClient = JsonWebKeySet({
  jwksUri: `https://${AuthenticationConfiguration.Domain}/.well-known/jwks.json`,
  strictSsl: true,
  cache: true,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function getSigningKey(kid: any): Promise<string> {
  return new Promise((resolve, reject): void => {
    jsonWebKeyClient.getSigningKey(kid, (err: any, key: any): void => {
      if (err) {
        reject(err);
      }

      resolve(key.publicKey || key.rsaPublicKey);
    });
  });
}

export const authorize: CustomAuthorizerHandler = async (
  event
): Promise<CustomAuthorizerResult> => {
  try {
    // Retrieve access token from request headers
    if (!event.authorizationToken) {
      return await Promise.reject("Unauthorized");
    }

    const tokenParts = event.authorizationToken.split(" ");
    const bearerToken = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === "bearer" && bearerToken)) {
      return await Promise.reject("Unauthorized");
    }

    // Decode access token to retrieve key id
    const decodedToken: any = JsonWebToken.decode(bearerToken, { complete: true });

    // Retrieve public key
    const signingKey = await getSigningKey(decodedToken.header.kid);

    // Verify access token
    const verifiedToken = JsonWebToken.verify(bearerToken, signingKey, {
      audience: AuthenticationConfiguration.Audience,
      issuer: `https://${AuthenticationConfiguration.Domain}/`,
      algorithms: ["RS256"],
    }) as any;

    // Extract custom information from token
    const customClaimIds = {
      Tenant:
        AuthenticationConfiguration.CustomClaimsNamespace +
        AuthenticationConfiguration.CustomClaims.Tenant,
    };

    const authorizations: PackedAuthorizations = {
      AuthorizedTenant: verifiedToken[customClaimIds.Tenant],
      AuthorizedPermissions: PackPermissions(verifiedToken.permissions as string[]),
    };

    if (!authorizations.AuthorizedTenant || !authorizations.AuthorizedPermissions) {
      return await Promise.reject("Unauthorized");
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
    return await Promise.reject("Unauthorized");
  }
};
