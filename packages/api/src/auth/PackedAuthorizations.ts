import { APIGatewayAuthorizerResultContext } from "aws-lambda";

const PermissionsSeparator = ",";

export interface PackedAuthorizations extends APIGatewayAuthorizerResultContext {
  // AWS won't let us use anything except numbers and strings here
  // so AuthorizedPermissions is a {PermissionsSeparator}-delimited string, sadly.
  AuthenticatedSubject: string;
  AuthorizedTenant: string;
  AuthorizedPermissions: string;
}

export function PackPermissions(permissions: string[]): string {
  return permissions.join(PermissionsSeparator);
}

export function UnpackPermissions(permissions: string): string[] {
  return permissions.split(PermissionsSeparator);
}
