import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import path from "path";
import { createLambda } from "../utils/createLambda";

export class ProductServiceStack extends cdk.Stack {
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

    const catalogItemsQueue = new sqs.Queue(this, "CatalogItemsQueue", {
      queueName: "CatalogItemsQueue",
    });

    // prepare environment variables
    const environment = {
      PRODUCTS_TABLE_NAME: productsTable.tableName,
      STOCKS_TABLE_NAME: stocksTable.tableName,
    };

    // Create lambdas
    const getProductsByIdLambda = createLambda(
      this,
      "GetProductsById",
      path.join(__dirname, "../product-service/lambda/getProductsById"),
      "getProductsById.handler",
      environment
    );
    const getProductsListLambda = createLambda(
      this,
      "GetProductsList",
      path.join(__dirname, "../product-service/lambda/getProductsList"),
      "getProductsList.handler",
      environment
    );
    const createProductLambda = createLambda(
      this,
      "CreateProduct",
      path.join(__dirname, "../product-service/lambda/createProduct"),
      "createProduct.handler",
      environment
    );
    const catalogBatchProcessLambda = createLambda(
      this,
      "CatalogBatchProcess",
      path.join(__dirname, "../product-service/lambda/catalogBatchProcess"),
      "catalogBatchProcess.handler",
      environment
    );

    // Grant read access to tables
    productsTable.grantReadData(getProductsByIdLambda);
    stocksTable.grantReadData(getProductsByIdLambda);
    productsTable.grantReadData(getProductsListLambda);
    stocksTable.grantReadData(getProductsListLambda);

    // Grant write access to tables
    productsTable.grantWriteData(createProductLambda);
    productsTable.grantWriteData(catalogBatchProcessLambda);
    stocksTable.grantWriteData(catalogBatchProcessLambda);

    // API Gateaway
    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

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

    // event source for the catalogBatchProcess lambda
    catalogBatchProcessLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );
  }
}
