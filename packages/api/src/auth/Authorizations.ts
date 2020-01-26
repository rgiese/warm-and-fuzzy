import { PackedAuthorizations, UnpackPermissions } from "./PackedAuthorizations";

import { APIGatewayProxyEvent } from "aws-lambda";

export default class Authorizations {
  private readonly _authenticatedSubject: string;
  private readonly _authorizedTenant: string;
  private readonly _authorizedPermissions: string[];

  public constructor(event: APIGatewayProxyEvent) {
    const authorizations = event.requestContext.authorizer as PackedAuthorizations;

    this._authenticatedSubject = authorizations.AuthenticatedSubject;
    this._authorizedTenant = authorizations.AuthorizedTenant;
    this._authorizedPermissions = UnpackPermissions(authorizations.AuthorizedPermissions);
  }

  public get AuthenticatedSubect(): string {
    return this._authenticatedSubject;
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
}
