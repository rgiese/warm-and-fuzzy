import * as GraphQL from "../../../generated/graphqlTypes";

import { ThermostatConfiguration, ZeroArgumentsConstructor } from "../../shared/db";

import MappedResolver from "./MappedResolver";
import ThermostatConfigurationMapper from "../mappers/ThermostatConfigurationMapper";
import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

const thermostatConfigurationModelConstructor: ZeroArgumentsConstructor<ThermostatConfiguration> = ThermostatConfiguration;

const thermostatConfigurationResolver = new MappedResolver<
  // GraphQL types
  GraphQL.ThermostatConfiguration,
  GraphQL.ThermostatConfigurationCreateInput,
  GraphQL.ThermostatConfigurationUpdateInput,
  // Model type
  ThermostatConfiguration,
  typeof thermostatConfigurationModelConstructor,
  // Mapper
  ThermostatConfigurationMapper
>(
  thermostatConfigurationModelConstructor,
  new ThermostatConfigurationMapper(),
  ThermostatConfigurationSchema.Schema
);

export default thermostatConfigurationResolver;
