import * as AWS from "aws-sdk";
import { products, stocks } from "./defaultDBData";
import { SeedDynamoDBProps, Product } from "./types";

const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

async function seedDynamoDBTable({ tableName, items }: SeedDynamoDBProps) {
  for (let i = 0; i < items.length; i++) {
    const params = {
      TableName: tableName,
      Item: items[i],
    };

    try {
      await documentClient.put(params).promise();
      console.log(`Table [${tableName}] Item [${i + 1}] inserted`);
    } catch (error) {
      console.error(
        `Error inserting item [${i + 1}] of table [${tableName}]:`,
        error
      );
    }
  }
}

seedDynamoDBTable({ tableName: "products", items: products }).then(() =>
  console.log("Seeding products complete.")
);
seedDynamoDBTable({ tableName: "stocks", items: stocks }).then(() =>
  console.log("Seeding stocks complete.")
);
