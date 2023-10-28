import * as GraphQL from "../../../generated/graphqlTypes";

import { DbMapper, UserPreferences } from "../../shared/db";

import UserPreferencesMapper from "../mappers/UserPreferencesMapper";
import { UserPreferencesSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import shallowUpdate from "./shallowUpdate";

class UserPreferencesResolver {
  public async getOneOrDefault(authenticatedSubject: string): Promise<GraphQL.UserPreferences> {
    try {
      const item = await DbMapper.get(
        Object.assign(new UserPreferences(), { id: authenticatedSubject })
      );
      return UserPreferencesMapper.graphqlFromModel(item);
    } catch (e) {
      // Return default instead
      return UserPreferencesSchema.DefaultUserPreferences;
    }
  }

  public async createOrUpdate(
    authenticatedSubject: string,
    input: GraphQL.UserPreferencesUpdateInput
  ): Promise<GraphQL.UserPreferences> {
    // Retrieve existing item or default
    const initialGraphql = await this.getOneOrDefault(authenticatedSubject);

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
