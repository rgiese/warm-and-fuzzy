import {
  DataMapperConfiguration,
  DataMapper as DynamoDBDataMapper,
} from "@aws/dynamodb-data-mapper";

import { DynamoDB } from "aws-sdk";

export interface ObjectWithId {
  id: string;
}

export interface ObjectWithIdAndTenant {
  tenant: string;
  id: string;
}

export type ZeroArgumentsConstructor<T> = new () => T;

class DataMapper extends DynamoDBDataMapper {
  public constructor(configuration: DataMapperConfiguration) {
    super(configuration);
  }

  public async getOne<T, TCondition extends ObjectWithId | ObjectWithIdAndTenant>(
    newItem: T,
    condition: TCondition
  ): Promise<T> {
    const item = await this.get<T>(Object.assign(newItem, condition));

    return item;
  }

  public async getBatch<T extends ObjectWithId | ObjectWithIdAndTenant>(
    conditions: T[]
  ): Promise<T[]> {
    const items = new Array<T>();

    for await (const item of this.batchGet(conditions)) {
      items.push(item);
    }

    return items;
  }
}

export const DbMapper = new DataMapper({
  client: new DynamoDB({ region: process.env.DYNAMODB_REGION as string }),
  tableNamePrefix: process.env.DYNAMODB_TABLE_NAME_PREFIX as string,
});
