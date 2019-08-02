import { APIGatewayProxyEvent } from "aws-lambda";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";

import Authorizations, { PermissionsSeparator } from "../auth/Authorizations";
import { Context } from "./context";

import resolvers from "./resolvers";
import typeDefs from "../../../shared/src/schema/schema.graphql";
import requiresPermissionDirective from "./requiresPermissionDirective";

const logger = { log: (e: any) => console.log(e) };

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: { requiresPermission: requiresPermissionDirective },
  logger,
}); // also consider inheritResolversFromInterfaces = true

const context = ({ event }: { event: APIGatewayProxyEvent }): Context => {
  const authorizations = event.requestContext.authorizer as Authorizations;
  return {
    AuthorizedTenant: authorizations.AuthorizedTenant,
    AuthorizedPermissions: authorizations.AuthorizedPermissions.split(PermissionsSeparator),
  };
};

const server = new ApolloServer({ schema, context });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
