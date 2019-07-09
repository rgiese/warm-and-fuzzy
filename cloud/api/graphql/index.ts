import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";

import { Resolvers } from "../generated/graphqlTypes";
import typeDefs from "./schema.graphql";

import ThermostatConfiguration from "../types/db/ThermostatConfiguration";
import DbMapper from "../types/db/DbMapper";

const resolvers: Resolvers = {
  Query: {
    hello: async () => {
      let configs: ThermostatConfiguration[] = [];

      for await (const config of DbMapper.query(ThermostatConfiguration, {
        tenant: "AmazingHouse",
      })) {
        configs.push(config);
      }

      return JSON.stringify(configs);
    },
  },
};

const logger = { log: (e: any) => console.log(e) };

const schema = makeExecutableSchema({ typeDefs, resolvers, logger });
// also consider inheritResolversFromInterfaces = true

const server = new ApolloServer({ schema });

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
});
