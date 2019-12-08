import { APIGatewayProxyEvent } from "aws-lambda";

import { PackedAuthorizations, UnpackPermissions } from "./PackedAuthorizations";

export default class Authorizations {
  public constructor(event: APIGatewayProxyEvent) {
    const authorizations = event.requestContext.authorizer as PackedAuthorizations;

    this._authorizedTenant = authorizations.AuthorizedTenant;
    this._authorizedPermissions = UnpackPermissions(authorizations.AuthorizedPermissions);
  }

  public get AuthorizedTenant(): string {
    return this._authorizedTenant;
  }

  public get AuthorizedPermissions(): string[] {
    return this._authorizedPermissions;
  }

  public HasPermission(permission: string): boolean {
    return this._authorizedPermissions.includes(permission);
  }

  private _authorizedTenant: string;
  private _authorizedPermissions: string[];
}
