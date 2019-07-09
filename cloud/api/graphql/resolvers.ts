import { Resolvers } from "../generated/graphqlTypes";

import { DbMapper, ThermostatConfiguration } from "../types/db";

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

export default resolvers;
