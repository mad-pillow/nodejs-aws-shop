import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SQSEvent } from "aws-lambda";

const dynamoDBCLient = new DynamoDBClient({
  region: "us-east-1",
});
const dynamodb = DynamoDBDocumentClient.from(dynamoDBCLient);
const snsClient = new SNSClient({ region: "us-east-1" });

export const handler = async (event: SQSEvent) => {
  console.log("Event: ", JSON.stringify(event, null, 2));

  const productsTableName = process.env.PRODUCTS_TABLE_NAME || "products";
  const stocksTableName = process.env.STOCKS_TABLE_NAME || "stocks";
  const snsTopicArn =
    process.env.SNS_TOPIC_ARN ||
    "arn:aws:sns:us-east-1:350262618260:CreateProductTopic";

  for (const record of event.Records) {
    const { body } = record;

    try {
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

      await snsClient.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Message: `New product created: ${JSON.stringify({
            id,
            ...rest,
            count,
          })}`,
          MessageAttributes: {
            price: {
              DataType: "Number",
              StringValue: rest.price,
            },
          },
        })
      );
    } catch (error) {
      console.error("Failed to create a product", error);
    }
  }

  console.log(`${event.Records.length} records processed.`);
};
