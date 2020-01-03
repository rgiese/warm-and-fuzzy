import { DynamoDB } from "aws-sdk";
import {
  DataMapper as DynamoDBDataMapper,
  DataMapperConfiguration,
} from "@aws/dynamodb-data-mapper";

export interface ObjectWithId {
  id: string;
}

export interface ObjectWithIdAndTenant {
  tenant: string;
  id: string;
}

export interface ZeroArgumentsConstructor<T> {
  new (): T;
}

class DataMapper extends DynamoDBDataMapper {
  public constructor(configuration: DataMapperConfiguration) {
    super(configuration);
  }

  public async getOne<T, K extends ObjectWithId | ObjectWithIdAndTenant>(
    newItem: T,
    condition: K
  ): Promise<T> {
    const item = await this.get<T>(Object.assign(newItem, condition));

    return item;
  }

  public async getBatch<T extends ObjectWithId | ObjectWithIdAndTenant>(
    conditions: T[]
  ): Promise<Array<T>> {
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
