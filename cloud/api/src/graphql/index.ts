import { APIGatewayProxyEvent } from "aws-lambda";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";

import Authorizations from "../auth/Authorizations";
import { Context } from "./context";

import resolvers from "./resolvers";
import typeDefs from "../../../shared/schema.graphql";

const logger = { log: (e: any) => console.log(e) };

const schema = makeExecutableSchema({ typeDefs, resolvers, logger }); // also consider inheritResolversFromInterfaces = true

const context = ({ event }: { event: APIGatewayProxyEvent }): Context => {
  const authorizations = event.requestContext.authorizer as Authorizations;
  return { authorizations };
};

const server = new ApolloServer({ schema, context });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});