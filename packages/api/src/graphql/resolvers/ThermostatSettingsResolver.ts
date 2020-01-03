import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver from "./MappedResolver";

import { ThermostatSettingsSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import { ThermostatSettings, ZeroArgumentsConstructor } from "../../shared/db";
import ThermostatSettingsMapper from "../mappers/ThermostatSettingsMapper";

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
