import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../generated/graphqlTypes";

import { DbMapper, ThermostatConfiguration } from "../shared/db";
import ThermostatConfigurationMapper from "./mappers/ThermostatConfigurationMapper";

const resolvers: GraphQL.Resolvers = {
  Query: {
    getThermostatConfigurations: async (_parent, _args, context) => {
      let configs: GraphQL.ThermostatConfiguration[] = [];

      for await (const config of DbMapper.query(ThermostatConfiguration, {
        tenant: context.AuthorizedTenant,
      })) {
        configs.push(ThermostatConfigurationMapper.publicFromPrivate(config));
      }

      return configs;
    },
    getThermostatConfiguration: async (_parents, args, context) => {
      const thermostatConfiguration = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.AuthorizedTenant,
          deviceId: args.deviceId,
        })
      );

      return ThermostatConfigurationMapper.publicFromPrivate(thermostatConfiguration);
    },
  },
  Mutation: {
    createThermostatConfiguration: async (_parent, args, context) => {
      // Verify provided values
      await ThermostatConfigurationSchema.Schema.validate(args.thermostatConfiguration);

      // Build new object with provided values
      let thermostatConfiguration = Object.assign(new ThermostatConfiguration(), {
        tenant: context.AuthorizedTenant,
        deviceId: args.thermostatConfiguration.deviceId,
      });

      ThermostatConfigurationMapper.privateFromPublic(
        thermostatConfiguration,
        args.thermostatConfiguration
      );

      // Persist changes
      await DbMapper.put(thermostatConfiguration);

      return ThermostatConfigurationMapper.publicFromPrivate(thermostatConfiguration);
    },
    updateThermostatConfiguration: async (_parent, args, context) => {
      // Retrieve existing item
      const thermostatConfiguration = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.AuthorizedTenant,
          deviceId: args.thermostatConfiguration.deviceId,
        })
      );

      // Copy over mutated values
      ThermostatConfigurationMapper.privateFromPublicUpdate(
        thermostatConfiguration,
        args.thermostatConfiguration
      );

      // Persist changes
      await DbMapper.put(thermostatConfiguration);

      return ThermostatConfigurationMapper.publicFromPrivate(thermostatConfiguration);
    },
  },
};

export default resolvers;
