import * as GraphQL from "../../generated/graphqlTypes";

import { GraphQLScalarType, Kind } from "graphql";

import latestSensorValueResolver from "./resolvers/LatestSensorValueResolver";
import latestThermostatValueResolver from "./resolvers/LatestThermostatValueResolver";
import sensorConfigurationResolver from "./resolvers/SensorConfigurationResolver";
import sensorValueStreamResolver from "./resolvers/SensorValueStreamResolver";
import thermostatConfigurationResolver from "./resolvers/ThermostatConfigurationResolver";
import thermostatSettingsResolver from "./resolvers/ThermostatSettingsResolver";
import thermostatValueStreamResolver from "./resolvers/ThermostatValueStreamResolver";
import userPreferencesResolver from "./resolvers/UserPreferencesResolver";

const resolvers: GraphQL.Resolvers = {
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */

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
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
        return new Date(ast.value); // AST value is always a string
      }
      return null;
    },
  }),

  //
  // Query
  //

  /* eslint-disable @typescript-eslint/explicit-function-return-type */
  Query: {
    getUserPreferences: async (_parent, _args, context) => {
      return userPreferencesResolver.getOne(context.AuthenticatedSubect);
    },
    getThermostatSettings: async (_parent, _args, context) => {
      return thermostatSettingsResolver.getAll(context.AuthorizedTenant);
    },
    getThermostatSetting: async (_parent, args, context) => {
      return thermostatSettingsResolver.getOne(context.AuthorizedTenant, args);
    },
    getThermostatConfigurations: async (_parent, _args, context) => {
      return thermostatConfigurationResolver.getAll(context.AuthorizedTenant);
    },
    getThermostatConfiguration: async (_parents, args, context) => {
      return thermostatConfigurationResolver.getOne(context.AuthorizedTenant, args);
    },
    getSensorConfigurations: async (_parent, _args, context) => {
      return sensorConfigurationResolver.getAll(context.AuthorizedTenant);
    },
    getSensorConfiguration: async (_parents, args, context) => {
      return sensorConfigurationResolver.getOne(context.AuthorizedTenant, args);
    },
    getLatestThermostatValues: async (_parent, _args, context) => {
      return latestThermostatValueResolver.getAll(context.AuthorizedTenant);
    },
    getLatestThermostatValue: async (_parents, args, context) => {
      return latestThermostatValueResolver.getOne(context.AuthorizedTenant, args);
    },
    getLatestSensorValues: async (_parent, _args, context) => {
      return latestSensorValueResolver.getAll(context.AuthorizedTenant);
    },
    getLatestSensorValue: async (_parents, args, context) => {
      return latestSensorValueResolver.getOne(context.AuthorizedTenant, args);
    },
    getThermostatValueStreams: async (_parents, args, context) => {
      return thermostatValueStreamResolver.getAllWithCondition(context.AuthorizedTenant, args);
    },
    getSensorValueStreams: async (_parents, args, context) => {
      return sensorValueStreamResolver.getAllWithCondition(context.AuthorizedTenant, args);
    },
  },

  //
  // Mutation
  //

  Mutation: {
    updateUserPreferences: async (_parent, args, context) => {
      return userPreferencesResolver.update(context.AuthenticatedSubect, args.userPreferences);
    },
    createThermostatSettings: async (_parent, args, context) => {
      return thermostatSettingsResolver.create(context.AuthorizedTenant, args.thermostatSettings);
    },
    updateThermostatSettings: async (_parent, args, context) => {
      return thermostatSettingsResolver.update(context.AuthorizedTenant, args.thermostatSettings);
    },
    createThermostatConfiguration: async (_parent, args, context) => {
      return thermostatConfigurationResolver.create(
        context.AuthorizedTenant,
        args.thermostatConfiguration
      );
    },
    updateThermostatConfiguration: async (_parent, args, context) => {
      return thermostatConfigurationResolver.update(
        context.AuthorizedTenant,
        args.thermostatConfiguration
      );
    },
    createSensorConfiguration: async (_parent, args, context) => {
      return sensorConfigurationResolver.create(context.AuthorizedTenant, args.sensorConfiguration);
    },
    updateSensorConfiguration: async (_parent, args, context) => {
      return sensorConfigurationResolver.update(context.AuthorizedTenant, args.sensorConfiguration);
    },
  },
};

export default resolvers;
