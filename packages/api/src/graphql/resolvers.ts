import { GraphQLScalarType, Kind } from "graphql";

import * as GraphQL from "../../generated/graphqlTypes";

import thermostatConfigurationResolver from "./resolvers/ThermostatConfigurationResolver";
import sensorConfigurationResolver from "./resolvers/SensorConfigurationResolver";

import latestActionResolver from "./resolvers/LatestActionResolver";
import latestValueResolver from "./resolvers/LatestValueResolver";

const resolvers: GraphQL.Resolvers = {
  //
  // Custom types
  //

  DateTime: new GraphQLScalarType({
    name: "DateTime",
    parseValue(value: any): Date {
      return new Date(value);
    },
    serialize(value: Date): string {
      return value.toISOString();
    },
    parseLiteral(ast): Date | null {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // AST value is always a string
      }
      return null;
    },
  }),

  //
  // Query
  //

  Query: {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getThermostatConfigurations: async (_parent, _args, context) => {
      return thermostatConfigurationResolver.getAll(context.AuthorizedTenant);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getThermostatConfiguration: async (_parents, args, context) => {
      return thermostatConfigurationResolver.getOne(context.AuthorizedTenant, {
        deviceId: args.deviceId,
      });
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getSensorConfigurations: async (_parent, _args, context) => {
      return sensorConfigurationResolver.getAll(context.AuthorizedTenant);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getSensorConfiguration: async (_parents, args, context) => {
      return sensorConfigurationResolver.getOne(context.AuthorizedTenant, {
        sensorId: args.sensorId,
      });
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getLatestActions: async (_parent, _args, context) => {
      return latestActionResolver.getAll(context.AuthorizedTenant);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getLatestAction: async (_parents, args, context) => {
      return latestActionResolver.getOne(context.AuthorizedTenant, {
        deviceId: args.deviceId,
      });
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getLatestValues: async (_parent, _args, context) => {
      return latestValueResolver.getAll(context.AuthorizedTenant);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getLatestValue: async (_parents, args, context) => {
      return latestValueResolver.getOne(context.AuthorizedTenant, {
        deviceId: args.sensorId,
      });
    },
  },

  //
  // Mutation
  //

  Mutation: {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    createThermostatConfiguration: async (_parent, args, context) => {
      return thermostatConfigurationResolver.create(
        context.AuthorizedTenant,
        args.thermostatConfiguration
      );
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateThermostatConfiguration: async (_parent, args, context) => {
      return thermostatConfigurationResolver.update(
        context.AuthorizedTenant,
        { deviceId: args.thermostatConfiguration.deviceId },
        args.thermostatConfiguration
      );
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    createSensorConfiguration: async (_parent, args, context) => {
      return sensorConfigurationResolver.create(context.AuthorizedTenant, args.sensorConfiguration);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateSensorConfiguration: async (_parent, args, context) => {
      return sensorConfigurationResolver.update(
        context.AuthorizedTenant,
        { sensorId: args.sensorConfiguration.sensorId },
        args.sensorConfiguration
      );
    },
  },
};

export default resolvers;
