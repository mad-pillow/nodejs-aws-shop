import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as crypto from "crypto";

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const productsTableName = process.env.PRODUCTS_TABLE_NAME || "products";
  console.log(
    "🚀 ~ process.env.PRODUCTS_TABLE_NAME:",
    process.env.PRODUCTS_TABLE_NAME
  );
  const stocksTableName = process.env.STOCKS_TABLE_NAME || "stocks";
  console.log(
    "🚀 ~ process.env.STOCKS_TABLE_NAME:",
    process.env.STOCKS_TABLE_NAME
  );

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET",
  };

  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Body is required" }),
    };
  }

  const { id, count, price, title, description } = JSON.parse(event.body);

  if (typeof title !== "string" || title.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Title is required and cannot be empty string",
      }),
    };
  }

  if (typeof description !== "string" || description.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Description is required and cannot be empty string",
      }),
    };
  }

  if (typeof price !== "number" || price < 0.01) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Price must be a number greater than or equal to 0.01",
      }),
    };
  }

  if (!Number.isInteger(count) || count < 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Count must be an integer greater than or equal to 0",
      }),
    };
  }

  const productId = id || crypto.randomUUID();

  const productItem = {
    id: productId,
    title,
    description,
    price,
  };

  const stockItem = {
    product_id: productId,
    count: count || 0,
  };

  try {
    await dynamodb
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: productsTableName,
              Item: productItem,
            },
          },
          {
            Put: {
              TableName: stocksTableName,
              Item: stockItem,
            },
          },
        ],
      })
      .promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: "Product created" }),
    };
  } catch (error) {
    console.error("Error fetching data", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to complete an operation" }),
    };
  }
};
