import * as GraphQL from "../../../generated/graphqlTypes";

import { SensorConfiguration, ZeroArgumentsConstructor } from "../../shared/db";

import MappedResolver from "./MappedResolver";
import SensorConfigurationMapper from "../mappers/SensorConfigurationMapper";
import { SensorConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";

const sensorConfigurationModelConstructor: ZeroArgumentsConstructor<SensorConfiguration> = SensorConfiguration;

const sensorConfigurationResolver = new MappedResolver<
  // GraphQL types
  GraphQL.SensorConfiguration,
  GraphQL.SensorConfigurationCreateInput,
  GraphQL.SensorConfigurationUpdateInput,
  // Model type
  SensorConfiguration,
  typeof sensorConfigurationModelConstructor,
  // Mapper
  SensorConfigurationMapper
>(
  sensorConfigurationModelConstructor,
  new SensorConfigurationMapper(),
  SensorConfigurationSchema.Schema
);

export default sensorConfigurationResolver;
