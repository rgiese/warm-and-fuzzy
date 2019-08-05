import { AuthenticationError } from "apollo-server-core";
import { GraphQLField, defaultFieldResolver } from "graphql";
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
  [GraphQL.RequiredPermission.ReadConfig, Authorization.Permissions.ReadConfig],
  [GraphQL.RequiredPermission.WriteConfig, Authorization.Permissions.WriteConfig],
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
