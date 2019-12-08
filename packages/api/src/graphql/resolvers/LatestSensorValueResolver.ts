import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver, { ZeroArgumentsConstructor } from "./MappedResolver";

import { SensorValue } from "../../shared/db";
import LatestSensorValueMapper from "../mappers/LatestSensorValueMapper";

const modelConstructor: ZeroArgumentsConstructor<SensorValue> = SensorValue;

const latestSensorValueResolver = new MappedResolver<
  // GraphQL types
  GraphQL.SensorValue,
  GraphQL.SensorValue,
  GraphQL.SensorValue,
  // Model type
  SensorValue,
  typeof modelConstructor,
  // Mapper
  LatestSensorValueMapper
>(modelConstructor, new LatestSensorValueMapper(), undefined);

export default latestSensorValueResolver;
