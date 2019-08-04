export default interface GraphQLModelMapper<TGraphQL, TGraphQLCreateInput, TModel> {
  graphqlFromModel(rhs: TModel): TGraphQL;
  modelFromGraphql(tenant: string, rhs: TGraphQLCreateInput): TModel;
}
