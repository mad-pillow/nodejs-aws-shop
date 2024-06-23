import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  try {
    const productId = event?.pathParameters?.productId;

    if (!productId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Server Error" }),
      };
    }

    const { Item: product } = await dynamodb
      .get({
        TableName: "products",
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
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
