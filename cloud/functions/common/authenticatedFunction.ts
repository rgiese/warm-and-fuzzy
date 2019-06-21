import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as JsonWebToken from "jsonwebtoken";

class UnauthorizedError extends Error {}
class InternalServerError extends Error {}

const jwtOptions = {
  audience: "https://api.warmandfuzzy.house",
  issuer: "https://grumpycorp.auth0.com/",
  algorithms: ["RS256"],
};

export function authenticatedFunction(requiredScope: string, next: AzureFunction): any {
  return async (context: Context, req: HttpRequest): Promise<any> => {
    try {
      // Retrieve access token from request headers
      const authHeader = "authorization";

      if (!(authHeader in req.headers)) {
        throw new UnauthorizedError(`Missing authorization header "${authHeader}"`);
      }

      const accessToken = req.headers[authHeader].replace("Bearer ", "");

      // Retrieve certificate from environment and apply envelope
      const auth0Secret = process.env.AUTH0_SECRET;

      if (!auth0Secret) {
        throw new InternalServerError("process.env.AUTH0_SECRET is empty.");
      }

      const auth0SecretWithEnvelope = `-----BEGIN CERTIFICATE-----\n${auth0Secret}\n-----END CERTIFICATE-----\n`;

      // Validate and decode access token including issuer and audience
      const decodedAccessToken = (await JsonWebToken.verify(
        accessToken,
        auth0SecretWithEnvelope,
        jwtOptions
      )) as any;

      // Validate required scope is present
      const scopes = (decodedAccessToken.scope as string).split(" ");

      if (!scopes.includes(requiredScope)) {
        throw new UnauthorizedError(
          `Scope ${requiredScope} not included in ${JSON.stringify(scopes)}`
        );
      }

      // Call wrapped function to do the real work
      return next(context, req);
    } catch (ex) {
      context.log.error(ex);

      if (ex instanceof UnauthorizedError || ex instanceof JsonWebToken.JsonWebTokenError) {
        return { status: 401, body: { message: ex.message } };
      } else {
        // including ex instanceof InternalServerError
        return { status: 500, body: { message: ex.message } };
      }
    }
  };
}
