import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver, { ZeroArgumentsConstructor } from "./MappedResolver";

import { ThermostatValue } from "../../shared/db";
import LatestThermostatValueMapper from "../mappers/LatestThermostatValueMapper";

const modelConstructor: ZeroArgumentsConstructor<ThermostatValue> = ThermostatValue;

const latestThermostatValueResolver = new MappedResolver<
  // GraphQL types
  GraphQL.ThermostatValue,
  GraphQL.ThermostatValue,
  GraphQL.ThermostatValue,
  // Model type
  ThermostatValue,
  typeof modelConstructor,
  // Mapper
  LatestThermostatValueMapper
>(modelConstructor, new LatestThermostatValueMapper(), undefined);

export default latestThermostatValueResolver;
