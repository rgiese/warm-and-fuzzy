import * as GraphQL from "../../../generated/graphqlTypes";

import { attribute, hashKey, table } from "@aws/dynamodb-data-mapper-annotations";

//
// See https://github.com/awslabs/dynamodb-data-mapper-js
//
// Note that we need to write full constructors for mapped objects
// so that field types don't get erased during lint:fix.
//

@table("UserPreferences")
export default class UserPreferences {
  // User ID ("sub" == subject in JWT) (assigned by Auth0)
  @hashKey()
  public id: string;

  // Temperature units
  @attribute()
  public temperatureUnits: GraphQL.TemperatureUnits;

  public constructor() {
    this.id = "";
    this.temperatureUnits = GraphQL.TemperatureUnits.Celsius;
  }
}
