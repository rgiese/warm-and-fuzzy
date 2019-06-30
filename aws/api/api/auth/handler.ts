import { Authorizer } from "./authorizer";
import { AWSPolicyGenerator } from "./aws-policy-generator";

const authorizer = new Authorizer(
  process.env.AUTH_TOKEN_ISSUER,
  process.env.AUTH_JWKS_URI,
  process.env.AUTH_AUDIENCE
);

export const authorize = (event: any, {/* context */}, callback: any): any => {
  try {
    console.log("event", event);
    if (!event.authorizationToken) {
      return callback("Unauthorized");
    }

    const tokenParts = event.authorizationToken.split(" ");
    const bearerToken = tokenParts[1];

    if (!(tokenParts[0].toLowerCase() === "bearer" && bearerToken)) {
      // No auth token provided
      return callback("Unauthorized");
    }

    authorizer
      .authorize(bearerToken)
      .then(result => {
        callback(null, AWSPolicyGenerator.generate(result.sub, "Allow", event.methodArn));
      })
      .catch(err => {
        console.log(err);
        callback("Unauthorized");
      });
  } catch (err) {
    console.log(err);
    callback("Unauthorized");
  }
};
