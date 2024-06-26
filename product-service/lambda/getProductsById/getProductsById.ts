import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

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
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  try {
    const productId = event.pathParameters!.productId!;

    const { Item: product } = await dynamodb
      .get({
        TableName: productsTableName,
        Key: { id: productId },
      })
      .promise();

    if (!product) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "This product Id was not found" }),
      };
    }

    const { Item: stock } = await dynamodb
      .get({
        TableName: stocksTableName,
        Key: { product_id: productId },
      })
      .promise();

    const joinedProduct = {
      ...product,
      count: stock?.count || 0,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(joinedProduct),
    };
  } catch (error) {
    console.error("Error fetching data", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to fetch data" }),
    };
  }
};
