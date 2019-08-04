import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver, { ZeroArgumentsConstructor } from "./MappedResolver";

import { SensorConfigurationSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { SensorConfiguration } from "../../shared/db";
import SensorConfigurationMapper from "../mappers/SensorConfigurationMapper";

const sensorConfigurationModelConstructor: ZeroArgumentsConstructor<
  SensorConfiguration
> = SensorConfiguration;

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
