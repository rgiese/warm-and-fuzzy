import { DynamoDB } from "aws-sdk";
import { DataMapper } from "@aws/dynamodb-data-mapper";

const dbMapper = new DataMapper({
  client: new DynamoDB({ region: process.env.DYNAMODB_REGION as string }),
});

export default dbMapper;
