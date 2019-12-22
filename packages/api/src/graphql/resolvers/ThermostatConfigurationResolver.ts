import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver, { ZeroArgumentsConstructor } from "./MappedResolver";

import { ThermostatConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatConfiguration } from "../../shared/db";
import ThermostatConfigurationMapper from "../mappers/ThermostatConfigurationMapper";

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
