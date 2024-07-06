import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SQSEvent } from "aws-lambda";

const dynamoDBCLient = new DynamoDBClient({
  region: "us-east-1",
});
const dynamodb = DynamoDBDocumentClient.from(dynamoDBCLient);

exports.handler = async (event: SQSEvent) => {
  console.log("Event: ", JSON.stringify(event, null, 2));

  const productsTableName = process.env.PRODUCTS_TABLE_NAME || "products";
  const stocksTableName = process.env.STOCKS_TABLE_NAME || "stocks";

  for (const record of event.Records) {
    const { body } = record;

    const { id, count, ...rest } = JSON.parse(body);

    await dynamodb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: productsTableName,
              Item: {
                id: id,
                ...rest,
              },
            },
          },
          {
            Put: {
              TableName: stocksTableName,
              Item: {
                product_id: id,
                count: count,
              },
            },
          },
        ],
      })
    );
  }

  console.log(`${event.Records.length} records processed.`);
};
