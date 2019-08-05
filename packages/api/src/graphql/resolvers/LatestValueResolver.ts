import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver, { ZeroArgumentsConstructor } from "./MappedResolver";

import { LatestValue } from "../../shared/db";
import LatestValueMapper from "../mappers/LatestValueMapper";

const modelConstructor: ZeroArgumentsConstructor<LatestValue> = LatestValue;

const latestValueResolver = new MappedResolver<
  // GraphQL types
  GraphQL.SensorValue,
  GraphQL.SensorValue,
  GraphQL.SensorValue,
  // Model type
  LatestValue,
  typeof modelConstructor,
  // Mapper
  LatestValueMapper
>(modelConstructor, new LatestValueMapper(), undefined);

export default latestValueResolver;
