import { TypeTools, UserPreferencesSchema } from "@grumpycorp/warm-and-fuzzy-shared";
import {
  UpdateUserPreferencesStoreMutation,
  UpdateUserPreferencesStoreMutationVariables,
  UserPreferences,
  UserPreferencesStoreQuery,
} from "../../generated/graphqlClient";
import { computed, flow } from "mobx";

import { ApolloClient } from "../../services/ApolloClient";
import { AuthStore } from "../auth";
import { GraphqlMutableStoreBase } from "../GraphqlMutableStoreBase";
import gql from "graphql-tag";

const userPreferencesFragment = gql`
  fragment UserPreferencesStoreFields on UserPreferences {
    temperatureUnits
  }
`;

const thermostatConfigurationsStoreDocument = gql`
  ${userPreferencesFragment}
  query UserPreferencesStore {
    getUserPreferences {
      ...UserPreferencesStoreFields
    }
  }
`;

const updateUserPreferencesStoreDocument = gql`
  ${userPreferencesFragment}
  mutation UpdateUserPreferencesStore($userPreferences: UserPreferencesUpdateInput!) {
    updateUserPreferences(userPreferences: $userPreferences) {
      ...UserPreferencesStoreFields
    }
  }
`;

//
// Since our GraphqlStoreBase/GraphqlMutableStoreBase infrastructure is designed for arrays of items,
// we need to inflate/deflate the single user preferences item into/from arrays.
//
// We'll inject bogus `id` property that we build/strip in the extractor/builder functions below.
//
// In general, consumers of the store shouldn't have to care and should just use
// the userPreferences get property and updateUserPreferences().
//

const userPreferencesId = "me";

export type UserPreferencesWithId = TypeTools.PropType<
  UserPreferencesStoreQuery,
  "getUserPreferences"
> & { id: string };

/* Member ordering gets too weird with annotations, generators, etc. */
/* eslint-disable @typescript-eslint/member-ordering */

export class UserPreferencesStore extends GraphqlMutableStoreBase<
  UserPreferencesWithId,
  UserPreferencesStoreQuery,
  UpdateUserPreferencesStoreMutation,
  UpdateUserPreferencesStoreMutationVariables
> {
  public constructor(authStore: AuthStore, apolloClient: ApolloClient) {
    super(
      "UserPreferences",
      authStore,
      apolloClient,
      // Mutation
      updateUserPreferencesStoreDocument,
      (item: UserPreferencesWithId) => {
        // Remove injected `id` property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...remainder } = item;

        return { userPreferences: remainder };
      },
      // Query
      thermostatConfigurationsStoreDocument,
      (queryData: UserPreferencesStoreQuery) => {
        // Inject `id` property, convert to fixed-sized array
        return [{ ...queryData.getUserPreferences, id: userPreferencesId }];
      }
    );
  }

  @computed public get userPreferences(): UserPreferences {
    if (this.data.length) {
      return this.data[0];
    }

    return UserPreferencesSchema.DefaultUserPreferences;
  }

  public updateUserPreferences = flow(function*(
    this: UserPreferencesStore,
    userPreferences: Partial<UserPreferences>
  ) {
    const existingPreferences = this.userPreferences;
    const mergedPreferences = Object.assign(existingPreferences, userPreferences);

    return this.updateItem({ ...mergedPreferences, id: userPreferencesId });
  });
}
