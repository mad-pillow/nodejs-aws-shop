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
    const { Items: products } = await dynamodb
      .scan({
        TableName: productsTableName,
      })
      .promise();

    if (!products) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([]),
      };
    }

    const promisedStocks = products.map((product) => {
      return dynamodb
        .get({
          TableName: stocksTableName,
          Key: {
            product_id: product.id,
          },
        })
        .promise();
    });

    const stocks = await Promise.all(promisedStocks);

    const joinedProducts = products.map((product) => {
      return {
        ...product,
        count:
          stocks.find((stock) => stock.Item?.product_id === product.id)?.Item
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
