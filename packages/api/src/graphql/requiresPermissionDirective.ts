import { AuthenticationError } from "apollo-server-core";
import { GraphQLField, defaultFieldResolver } from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";

import { Context } from "./context";

interface RequiresPermissionArgs {
  permission: string;
}

class RequiresPermissionDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, Context>) {
    const { permission } = this.args as RequiresPermissionArgs;
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function(...args) {
      const context = args[2];

      if (!context.AuthorizedPermissions.includes(permission)) {
        throw new AuthenticationError("Not authorized");
      }

      return resolve.apply(this, args);
    };
  }
}

export default RequiresPermissionDirective;
