import * as GraphQL from "../../../generated/graphqlTypes";

import { DbMapper, UserPreferences } from "../../shared/db";

import { ItemNotFoundException } from "@aws/dynamodb-data-mapper";
import UserPreferencesMapper from "../mappers/UserPreferencesMapper";
import { UserPreferencesSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import shallowUpdate from "./shallowUpdate";

class UserPreferencesResolver {
  public async getOne(authenticatedSubject: string): Promise<GraphQL.UserPreferences> {
    const item = await DbMapper.get(
      Object.assign(new UserPreferences(), { id: authenticatedSubject })
    );

    return UserPreferencesMapper.graphqlFromModel(item);
  }

  public async createOrUpdate(
    authenticatedSubject: string,
    input: GraphQL.UserPreferencesUpdateInput
  ): Promise<GraphQL.UserPreferences> {
    // Retrieve existing item
    let initialModel = new UserPreferences();

    try {
      initialModel = await DbMapper.get(
        Object.assign(new UserPreferences(), { id: authenticatedSubject })
      );
    } catch (e) {
      if (e instanceof ItemNotFoundException) {
        // Ignore - treat as create rather than update
      } else {
        throw e;
      }
    }

    // Build GraphQL representation
    const initialGraphql = UserPreferencesMapper.graphqlFromModel(initialModel);

    // Merge in mutated values
    const updatedGraphql = shallowUpdate(initialGraphql, input);

    // Verify combined values
    await UserPreferencesSchema.Schema.validate(updatedGraphql);

    // Persist changes
    const updatedModel = UserPreferencesMapper.modelFromGraphql(
      authenticatedSubject,
      updatedGraphql
    );

    await DbMapper.put(updatedModel);

    return updatedGraphql;
  }
}

const userPreferencesResolver = new UserPreferencesResolver();

export default userPreferencesResolver;
