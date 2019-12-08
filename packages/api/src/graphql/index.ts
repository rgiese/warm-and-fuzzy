import { APIGatewayProxyEvent } from "aws-lambda";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";

import { Context } from "./context";
import resolvers from "./resolvers";
import typeDefs from "../../../shared/src/schema/schema.graphql";
import requiresPermissionDirective from "./requiresPermissionDirective";

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
