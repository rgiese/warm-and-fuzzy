import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";
import typeDefs from "./schema.graphql";

const logger = { log: (e: any) => console.log(e) };

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers, logger });
// also consider inheritResolversFromInterfaces = true

const server = new ApolloServer({ schema });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
