import {
  SensorConfigurationSchema,
  ThermostatConfigurationSchema,
} from "@grumpycorp/warm-and-fuzzy-shared";

import * as GraphQL from "../../generated/graphqlTypes";

import { DbMapper, SensorConfiguration, ThermostatConfiguration } from "../shared/db";

import SensorConfigurationMapper from "./mappers/SensorConfigurationMapper";
import ThermostatConfigurationMapper from "./mappers/ThermostatConfigurationMapper";

import shallowUpdate from "./shallowUpdate";

const resolvers: GraphQL.Resolvers = {
  Query: {
    //
    // ThermostatConfiguration
    //

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getThermostatConfigurations: async (_parent, _args, context) => {
      let configs: GraphQL.ThermostatConfiguration[] = [];

      for await (const configModel of DbMapper.query(ThermostatConfiguration, {
        tenant: context.AuthorizedTenant,
      })) {
        configs.push(ThermostatConfigurationMapper.graphqlFromModel(configModel));
      }

      return configs;
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getThermostatConfiguration: async (_parents, args, context) => {
      const configModel = await DbMapper.get(
        Object.assign(new ThermostatConfiguration(), {
          tenant: context.AuthorizedTenant,
          deviceId: args.deviceId,
        })
      );

      return ThermostatConfigurationMapper.graphqlFromModel(configModel);
    },

    //
    // SensorConfiguration
    //

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getSensorConfigurations: async (_parent, _args, context) => {
      let configs: GraphQL.SensorConfiguration[] = [];

      for await (const configModel of DbMapper.query(SensorConfiguration, {
        tenant: context.AuthorizedTenant,
      })) {
        configs.push(SensorConfigurationMapper.graphqlFromModel(configModel));
      }

      return configs;
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getSensorConfiguration: async (_parents, args, context) => {
      const configModel = await DbMapper.get(
        Object.assign(new SensorConfiguration(), {
          tenant: context.AuthorizedTenant,
          deviceId: args.deviceId,
        })
      );

      return SensorConfigurationMapper.graphqlFromModel(configModel);
    },
  },
  Mutation: {
    //
    // ThermostatConfiguration
    //

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

    //
    // SensorConfiguration
    //

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    createSensorConfiguration: async (_parent, args, context) => {
      // Verify provided values
      await SensorConfigurationSchema.Schema.validate(args.sensorConfiguration);

      // Build new object with provided values
      const thermostatConfiguration = SensorConfigurationMapper.modelFromGraphql(
        context.AuthorizedTenant,
        args.sensorConfiguration
      );

      // Persist changes
      await DbMapper.put(thermostatConfiguration);

      return SensorConfigurationMapper.graphqlFromModel(thermostatConfiguration);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateSensorConfiguration: async (_parent, args, context) => {
      // Retrieve existing item
      const initialModel = await DbMapper.get(
        Object.assign(new SensorConfiguration(), {
          tenant: context.AuthorizedTenant,
          sensorId: args.sensorConfiguration.sensorId,
        })
      );

      // Build GraphQL representation
      const initialGraphql = SensorConfigurationMapper.graphqlFromModel(initialModel);

      // Merge in mutated values
      const updatedGraphql = shallowUpdate(initialGraphql, args.sensorConfiguration);

      // Verify combined values
      await SensorConfigurationSchema.Schema.validate(updatedGraphql);

      // Persist changes
      const updatedModel = SensorConfigurationMapper.modelFromGraphql(
        context.AuthorizedTenant,
        updatedGraphql
      );

      await DbMapper.put(updatedModel);

      return updatedGraphql;
    },
  },
};

export default resolvers;
