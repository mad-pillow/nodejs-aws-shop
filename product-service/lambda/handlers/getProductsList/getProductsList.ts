import { stocks } from "./../../../db/defaultDBData";
import { products } from "./../../../../cdk.out/asset.a5c048ab9bb7eeab363b61c53b717fd41bf532242cd16fa871dae63fcba3d410/getProductsList";
import { APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

exports.handler = async function (): Promise<APIGatewayProxyResult> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  try {
    const { Items: products } = await dynamodb
      .scan({
        TableName: "products",
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
          TableName: "stocks",
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
