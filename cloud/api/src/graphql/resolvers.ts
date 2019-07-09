import { Resolvers } from "../../generated/graphqlTypes";
import { DbMapper, ThermostatConfiguration } from "../shared/db";

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
  Mutation: {
    createThermostatConfiguration: async (_parent, args, context) => {
      // Build new object with provided values
      const thermostatConfiguration = Object.assign(new ThermostatConfiguration(), {
        tenant: context.authorizations.AuthorizedTenant,
        deviceId: args.deviceId,
        ...args.thermostatConfiguration,
      });

      // Persist changes
      await DbMapper.put(thermostatConfiguration);

      return thermostatConfiguration;
    },
    updateThermostatConfiguration: async (_parent, args, context) => {
      // Retrieve existing item
      const thermostatConfiguration = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.authorizations.AuthorizedTenant,
          deviceId: args.deviceId,
        })
      );

      // Copy over mutated values
      Object.assign(thermostatConfiguration, args.thermostatConfiguration);

      // Persist changes
      await DbMapper.put(thermostatConfiguration);

      return thermostatConfiguration;
    },
  },
};

export default resolvers;
