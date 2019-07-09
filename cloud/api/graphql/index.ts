import { APIGatewayProxyEvent } from "aws-lambda";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";

import Authorizations from "../api/auth/Authorizations";
import { Context } from "./context";

import { Resolvers } from "../generated/graphqlTypes";
import typeDefs from "./schema.graphql";

import ThermostatConfiguration from "../types/db/ThermostatConfiguration";
import DbMapper from "../types/db/DbMapper";

const resolvers: Resolvers = {
  Query: {
    getThermostatConfigurations: async (_parent, _args, context) => {
      let configs: ThermostatConfiguration[] = [];

      for await (const config of DbMapper.query(ThermostatConfiguration, {
        tenant: context.authorizations.AuthorizedTenant,
      })) {
        configs.push(config);
      }

      return configs;
    },
    getThermostatConfiguration: async (_parents, args, context) => {
      const thermostatConfiguration = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.authorizations.AuthorizedTenant,
          deviceId: args.deviceId,
        })
      );

      return thermostatConfiguration;
    },
  },
};

const logger = { log: (e: any) => console.log(e) };

const schema = makeExecutableSchema({ typeDefs, resolvers, logger });
// also consider inheritResolversFromInterfaces = true

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
