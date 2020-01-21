import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";

import { APIGatewayProxyEvent } from "aws-lambda";
import { Context } from "./context";
import requiresPermissionDirective from "./requiresPermissionDirective";
import resolvers from "./resolvers";
import typeDefs from "../../../shared/src/schema/schema.graphql";

const logger = { log: (e: any): void => console.log(e) };

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: { requiresPermission: requiresPermissionDirective },
  logger,
}); // also consider inheritResolversFromInterfaces = true

const context = ({ event }: { event: APIGatewayProxyEvent }): Context => {
  return new Context(event);
};

const server = new ApolloServer({ schema, context });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
