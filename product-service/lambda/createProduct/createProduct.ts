import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as crypto from "crypto";

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
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

  const { id, count, ...newProductData } = JSON.parse(event.body);

  const productId = id || crypto.randomUUID();

  const productItem = {
    id: productId,
    ...newProductData,
  };

  const stockItem = {
    product_id: productId,
    count: count || 0,
  };

  try {
    await dynamodb
      .put({
        TableName: "products",
        Item: productItem,
      })
      .promise();

    await dynamodb
      .put({
        TableName: "stocks",
        Item: stockItem,
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
