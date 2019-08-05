import * as GraphQL from "../../../generated/graphqlTypes";
import MappedResolver, { ZeroArgumentsConstructor } from "./MappedResolver";

import { LatestAction } from "../../shared/db";
import LatestActionMapper from "../mappers/LatestActionMapper";

const modelConstructor: ZeroArgumentsConstructor<LatestAction> = LatestAction;

const latestActionResolver = new MappedResolver<
  // GraphQL types
  GraphQL.DeviceAction,
  GraphQL.DeviceAction,
  GraphQL.DeviceAction,
  // Model type
  LatestAction,
  typeof modelConstructor,
  // Mapper
  LatestActionMapper
>(modelConstructor, new LatestActionMapper(), undefined);

export default latestActionResolver;
