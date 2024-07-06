import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamoDBCLient = new DynamoDBClient({
  region: "us-east-1",
});
const dynamodb = DynamoDBDocumentClient.from(dynamoDBCLient);

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const productsTableName = process.env.PRODUCTS_TABLE_NAME || "products";
  const stocksTableName = process.env.STOCKS_TABLE_NAME || "stocks";

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  try {
    const productId = event.pathParameters!.productId!;

    const getProductCommand = new GetItemCommand({
      TableName: productsTableName,
      Key: { id: { S: productId } },
    });

    const { Item: product } = await dynamodb.send(getProductCommand);

    if (!product) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "This product Id was not found" }),
      };
    }

    const getStockCommand = new GetItemCommand({
      TableName: stocksTableName,
      Key: { product_id: { S: productId } },
    });

    const { Item: stock } = await dynamodb.send(getStockCommand);

    const joinedProduct = {
      ...unmarshall(product),
      count: stock ? unmarshall(stock).count : 0,
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
