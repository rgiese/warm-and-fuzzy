import { AuthenticationError } from "apollo-server-core";
import { defaultFieldResolver, GraphQLField } from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";

import { Context } from "./context";
import * as GraphQL from "../../generated/graphqlTypes";

import { Authorization } from "@grumpycorp/warm-and-fuzzy-shared";

//
// We can't define GraphQL enum values that exactly match the strings we're using for user permissions
// so we need to remap them.
//

const mapGraphQLPermissionToUserPermission = new Map<
  GraphQL.RequiredPermission,
  Authorization.Permissions
>([
  [GraphQL.RequiredPermission.ReadData, Authorization.Permissions.ReadData],
  [GraphQL.RequiredPermission.ReadConfig, Authorization.Permissions.ReadConfig],
  [GraphQL.RequiredPermission.WriteConfig, Authorization.Permissions.WriteConfig],
  [GraphQL.RequiredPermission.ReadSettings, Authorization.Permissions.ReadSettings],
  [GraphQL.RequiredPermission.WriteSettings, Authorization.Permissions.WriteSettings],
  [GraphQL.RequiredPermission.CrossTenantAdmin, Authorization.Permissions.CrossTenantAdmin],
]);

const throwUndefinedPermission = (permission: GraphQL.RequiredPermission): string => {
  throw new Error(`Unrecognized permission '${permission}'`);
};

interface RequiresPermissionArgs {
  permission: GraphQL.RequiredPermission;
}

class RequiresPermissionDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, Context>): void {
    const { permission } = this.args as RequiresPermissionArgs;
    const { resolve = defaultFieldResolver } = field;

    const requiredPermission =
      mapGraphQLPermissionToUserPermission.get(permission) || throwUndefinedPermission(permission);

    field.resolve = async function(...args): Promise<any> {
      const context = args[2];

      if (!context.HasPermission(requiredPermission)) {
        throw new AuthenticationError("Not authorized");
      }

      return resolve.apply(this, args);
    };
  }
}

export default RequiresPermissionDirective;
