import { AuthResponseContext } from "aws-lambda";

export default interface Authorizations extends AuthResponseContext {
  // AWS won't let us use anything except numbers and strings here
  // so AuthorizedPermissions is a {PermissionsSeparator}-delimited string, sadly.
  AuthorizedTenant: string;
  AuthorizedPermissions: string;
}

export const PermissionsSeparator = ",";
