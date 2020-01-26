import * as GraphQL from "../../../generated/graphqlTypes";

import { DbMapper, UserPreferences } from "../../shared/db";

import UserPreferencesMapper from "../mappers/UserPreferencesMapper";
import { UserPreferencesSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import shallowUpdate from "./shallowUpdate";

class UserPreferencesResolver {
  public async getOneOrDefault(authenticatedSubject: string): Promise<GraphQL.UserPreferences> {
    let initialModel = new UserPreferences();

    try {
      initialModel = await DbMapper.get(Object.assign(initialModel, { id: authenticatedSubject }));
    } catch (e) {
      // Ignore - use default instead
    }

    return UserPreferencesMapper.graphqlFromModel(initialModel);
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
