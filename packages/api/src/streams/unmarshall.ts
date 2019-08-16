import { AttributeValue } from "aws-lambda";

import { DynamoDbSchema, StringToAnyObjectMap } from "@aws/dynamodb-data-mapper";
import { unmarshallItem, ZeroArgumentsConstructor } from "@aws/dynamodb-data-marshaller";

export default function/* unmarshall */ <T extends StringToAnyObjectMap>(
  item: T,
  marshalledData: { [key: string]: AttributeValue }
): T {
  // c.f. @aws/dynamodb-data-mapper > DataMapper.get()
  const schema = (item as any)[DynamoDbSchema];
  return unmarshallItem<T>(schema, marshalledData, item.constructor as ZeroArgumentsConstructor<T>);
}
