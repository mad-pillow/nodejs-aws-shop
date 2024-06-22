import * as AWS from "aws-sdk";

import { products, stocks } from "./defaultDBData";
import { SeedDynamoDBProps } from "./types";

const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

async function seedDynamoDBTable({ tableName, items }: SeedDynamoDBProps) {
  for (const item of items) {
    const params = {
      TableName: tableName,
      Item: item,
    };

    try {
      await documentClient.put(params).promise();
      console.log(`Table [${tableName}] Item [${item.id}] inserted`);
    } catch (error) {
      console.error(`Error inserting item ${item.id}:`, error);
    }
  }
}

seedDynamoDBTable({ tableName: "products", items: products }).then(() =>
  console.log("Seeding products complete.")
);
seedDynamoDBTable({ tableName: "stocks", items: stocks }).then(() =>
  console.log("Seeding stocks complete.")
);
