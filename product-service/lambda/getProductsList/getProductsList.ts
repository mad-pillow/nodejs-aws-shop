import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
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
    const scanProductsCommand = new ScanCommand({
      TableName: productsTableName,
    });

    const { Items: products } = await dynamodb.send(scanProductsCommand);

    if (!products) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([]),
      };
    }

    const unmarshalledProducts = products.map((product) => unmarshall(product));

    const promisedStocks = unmarshalledProducts.map((product) => {
      const getStockCommand = new GetItemCommand({
        TableName: stocksTableName,
        Key: {
          product_id: { S: product.id },
        },
      });

      return dynamodb.send(getStockCommand);
    });

    const stocks = await Promise.all(promisedStocks);

    const unmarshalledStocks = stocks.map((stock) => unmarshall(stock.Item!));

    const joinedProducts = unmarshalledProducts.map((product) => {
      return {
        ...product,
        count:
          unmarshalledStocks.find((stock) => stock.product_id === product.id)
            ?.count || 0,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(joinedProducts),
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
