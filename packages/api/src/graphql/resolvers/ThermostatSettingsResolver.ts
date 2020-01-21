import * as GraphQL from "../../../generated/graphqlTypes";

import { ThermostatSettings, ZeroArgumentsConstructor } from "../../shared/db";

import MappedResolver from "./MappedResolver";
import ThermostatSettingsMapper from "../mappers/ThermostatSettingsMapper";
import { ThermostatSettingsSchema } from "@grumpycorp/warm-and-fuzzy-shared";

const thermostatSettingsModelConstructor: ZeroArgumentsConstructor<ThermostatSettings> = ThermostatSettings;

const thermostatSettingsResolver = new MappedResolver<
  // GraphQL types
  GraphQL.ThermostatSettings,
  GraphQL.ThermostatSettingsCreateInput,
  GraphQL.ThermostatSettingsUpdateInput,
  // Model type
  ThermostatSettings,
  typeof thermostatSettingsModelConstructor,
  // Mapper
  ThermostatSettingsMapper
>(
  thermostatSettingsModelConstructor,
  new ThermostatSettingsMapper(),
  ThermostatSettingsSchema.Schema
);

export default thermostatSettingsResolver;
