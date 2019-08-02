import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../generated/graphqlTypes";

import { DbMapper, ThermostatConfiguration } from "../shared/db";
import ThermostatConfigurationMapper from "./mappers/ThermostatConfigurationMapper";

import shallowUpdate from "./shallowUpdate";

const resolvers: GraphQL.Resolvers = {
  Query: {
    getThermostatConfigurations: async (_parent, _args, context) => {
      let configs: GraphQL.ThermostatConfiguration[] = [];

      for await (const configModel of DbMapper.query(ThermostatConfiguration, {
        tenant: context.AuthorizedTenant,
      })) {
        configs.push(ThermostatConfigurationMapper.graphqlFromModel(configModel));
      }

      return configs;
    },
    getThermostatConfiguration: async (_parents, args, context) => {
      const configModel = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.AuthorizedTenant,
          deviceId: args.deviceId,
        })
      );

      return ThermostatConfigurationMapper.graphqlFromModel(configModel);
    },
  },
  Mutation: {
    createThermostatConfiguration: async (_parent, args, context) => {
      // Verify provided values
      await ThermostatConfigurationSchema.Schema.validate(args.thermostatConfiguration);

      // Build new object with provided values
      const thermostatConfiguration = ThermostatConfigurationMapper.modelFromGraphql(
        context.AuthorizedTenant,
        args.thermostatConfiguration
      );

      // Persist changes
      await DbMapper.put(thermostatConfiguration);

      return ThermostatConfigurationMapper.graphqlFromModel(thermostatConfiguration);
    },
    updateThermostatConfiguration: async (_parent, args, context) => {
      // Retrieve existing item
      const initialModel = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.AuthorizedTenant,
          deviceId: args.thermostatConfiguration.deviceId,
        })
      );

      // Build GraphQL representation
      const initialGraphql = ThermostatConfigurationMapper.graphqlFromModel(initialModel);

      // Merge in mutated values
      const updatedGraphql = shallowUpdate(initialGraphql, args.thermostatConfiguration);

      // Verify combined values
      await ThermostatConfigurationSchema.Schema.validate(updatedGraphql);

      // Persist changes
      const updatedModel = ThermostatConfigurationMapper.modelFromGraphql(
        context.AuthorizedTenant,
        updatedGraphql
      );

      await DbMapper.put(updatedModel);

      return updatedGraphql;
    },
  },
};

export default resolvers;
