import * as jwt from "jsonwebtoken";
import * as jwks from "jwks-rsa";

export class Authorizer {
  private issuer: string;
  private jwksUri: string;
  private audience: string;

  public constructor(issuer: string, jwksUri: string, audience: string) {
    this.issuer = issuer;
    this.jwksUri = jwksUri;
    this.audience = audience;
  }

  public authorize(token: string): Promise<any> {
    let decoded: any = jwt.decode(token, { complete: true });
    return this.getKey(decoded.header.kid).then(x => {
      return this.verify(token, x);
    });
  }

  private getKey(kid: any): Promise<string> {
    const client = jwks({
      strictSsl: true,
      jwksUri: this.jwksUri,
    });

    return new Promise((resolve, reject) => {
      client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        }

        resolve(key.publicKey || key.rsaPublicKey);
      });
    });
  }

  private verify(token: string, cert: string): Promise<{}> {
    const options = {
      audience: this.audience,
      issuer: this.issuer,
    };

    return new Promise((resolve, reject) => {
      jwt.verify(token, cert, options, (err, decoded) => {
        if (err) {
          reject(err);
        }

        resolve(decoded);
      });
    });
  }
}
