import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { createLambda } from "../product-service/utils/createLambda";

export class NodejsAwsShopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get existing tables
    const productsTable = dynamodb.Table.fromTableName(
      this,
      "ProductsTable",
      "products"
    );
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      "StocksTable",
      "stocks"
    );

    // prepare environment variables
    const environment = {
      PRODUCTS_TABLE_NAME: productsTable.tableName,
      STOCKS_TABLE_NAME: stocksTable.tableName,
    };

    // Create lambdas
    const getProductsByIdLambda = createLambda(
      this,
      "GetProductsById",
      "getProductsById",
      environment
    );
    const getProductsListLambda = createLambda(
      this,
      "GetProductsList",
      "getProductsList",
      environment
    );
    const createProductLambda = createLambda(
      this,
      "CreateProduct",
      "createProduct",
      environment
    );

    // Grant read access to tables
    productsTable.grantReadData(getProductsByIdLambda);
    stocksTable.grantReadData(getProductsByIdLambda);
    productsTable.grantReadData(getProductsListLambda);
    stocksTable.grantReadData(getProductsListLambda);

    // Grant write access to tables
    productsTable.grantWriteData(createProductLambda);

    // API Gateaway
    const api = new apigateway.RestApi(this, "Api", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // health handler with API gateaway integration
    const healthResource = api.root.addResource("health");
    const healthIntegration = new apigateway.LambdaIntegration(
      createLambda(this, "CheckHealth", "checkHealth")
    );
    healthResource.addMethod("GET", healthIntegration);

    // all products list handler with API gateaway integration
    const productsResource = api.root.addResource("products");
    const getProductsListIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda
    );
    productsResource.addMethod("GET", getProductsListIntegration);

    // single product handler with API gateaway integration
    const productResource = productsResource.addResource("{productId}");
    const getSingleProductIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambda
    );
    productResource.addMethod("GET", getSingleProductIntegration);

    // create product handler with API gateaway integration
    const createProductIntegration = new apigateway.LambdaIntegration(
      createProductLambda
    );
    productsResource.addMethod("POST", createProductIntegration);
  }
}
