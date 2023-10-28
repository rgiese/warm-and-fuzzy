import * as GraphQL from "../../../generated/graphqlTypes";

import { UserPreferences } from "../../shared/db";

//
// Adapt GraphQL <-> Model (DB) conventions:
// - no current adjustments
//

namespace UserPreferencesMapper {
  export function graphqlFromModel(rhs: UserPreferences): GraphQL.UserPreferences {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...remainder } = rhs;

    return {
      ...remainder,
    };
  }

  export function modelFromGraphql(
    authenticatedSubject: string,
    rhs: GraphQL.UserPreferencesUpdateInput
  ): UserPreferences {
    const { ...remainder } = rhs;

    return Object.assign(new UserPreferences(), {
      id: authenticatedSubject,
      ...remainder,
    });
  }
}

export default UserPreferencesMapper;
