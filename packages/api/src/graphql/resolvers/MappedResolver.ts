import * as yup from "yup";

import {
  DbMapper,
  ObjectWithId,
  ObjectWithIdAndTenant,
  ZeroArgumentsConstructor,
} from "../../shared/db";
import GraphQLModelMapper from "../mappers/GraphQLModelMapper";

import shallowUpdate from "./shallowUpdate";

export default class MappedResolver<
  TGraphQL extends TGraphQLCreateInput,
  TGraphQLCreateInput extends object,
  TGraphQLUpdateInput extends ObjectWithId,
  TModel extends ObjectWithIdAndTenant,
  TModelConstructor extends ZeroArgumentsConstructor<TModel>,
  TMapper extends GraphQLModelMapper<TGraphQL, TGraphQLCreateInput, TModel>
> {
  public constructor(
    modelConstructor: TModelConstructor,
    mapper: TMapper,
    schema?: yup.ObjectSchema
  ) {
    this._modelConstructor = modelConstructor;
    this._mapper = mapper;
    this._schema = schema;
  }

  public async getAll(tenant: string): Promise<TGraphQL[]> {
    const items: TGraphQL[] = [];

    for await (const modelItem of DbMapper.query(this._modelConstructor, { tenant })) {
      items.push(this._mapper.graphqlFromModel(modelItem));
    }

    return items;
  }

  public async getOne<TArgs extends ObjectWithId>(tenant: string, args: TArgs): Promise<TGraphQL> {
    const itemCondition: Pick<TModel, "tenant" | "id"> = { tenant, id: args.id };

    const item = await DbMapper.get(Object.assign(new this._modelConstructor(), itemCondition));

    return this._mapper.graphqlFromModel(item);
  }

  public async create(tenant: string, input: TGraphQLCreateInput): Promise<TGraphQL> {
    // Verify provided values
    if (!this._schema) {
      throw new Error("Schema required to create.");
    }

    await this._schema.validate(input);

    // Build new object with provided values
    const item = this._mapper.modelFromGraphql(tenant, input);

    // Persist changes
    await DbMapper.put(item);

    return this._mapper.graphqlFromModel(item);
  }

  public async update(tenant: string, input: TGraphQLUpdateInput): Promise<TGraphQL> {
    // Retrieve existing item
    const initialModelCondition: Pick<TModel, "tenant" | "id"> = { tenant, id: input.id };

    const initialModel = await DbMapper.get(
      Object.assign(new this._modelConstructor(), initialModelCondition)
    );

    // Build GraphQL representation
    const initialGraphql = this._mapper.graphqlFromModel(initialModel);

    // Merge in mutated values
    const updatedGraphql = shallowUpdate(initialGraphql, input);

    // Verify combined values
    if (!this._schema) {
      throw new Error("Schema required to update.");
    }

    await this._schema.validate(updatedGraphql);

    // Persist changes
    const updatedModel = this._mapper.modelFromGraphql(tenant, updatedGraphql);

    await DbMapper.put(updatedModel);

    return updatedGraphql;
  }

  private _modelConstructor: TModelConstructor;
  private _mapper: TMapper;
  private _schema?: yup.ObjectSchema;
}
