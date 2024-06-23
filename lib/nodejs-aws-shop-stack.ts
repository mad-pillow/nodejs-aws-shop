import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { checkHealth } from "../product-service/lambda/functions/checkHealth/checkHealth";
import { getProductsById } from "../product-service/lambda/functions/getProductsById/getProductsById";
import { getProductsList } from "../product-service/lambda/functions/getProductsList/getProductsList";

export class NodejsAwsShopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const getProductsByIdLambda = getProductsById(this);
    const getProductsListLambda = getProductsList(this);

    productsTable.grantReadData(getProductsByIdLambda);
    stocksTable.grantReadData(getProductsByIdLambda);
    productsTable.grantReadData(getProductsListLambda);
    stocksTable.grantReadData(getProductsListLambda);

    // API Gateaway
    const api = new apigateway.RestApi(this, "Api");

    // health handler with API gateaway integration
    const healthResource = api.root.addResource("health");
    const healthIntegration = new apigateway.LambdaIntegration(
      checkHealth(this)
    );
    healthResource.addMethod("GET", healthIntegration);

    // all products list handler with API gateaway integration
    const getProductsListResource = api.root.addResource("products");
    const getProductsListIntegration = new apigateway.LambdaIntegration(
      getProductsListLambda
    );
    getProductsListResource.addMethod("GET", getProductsListIntegration);

    // single product handler with API gateaway integration
    const getSingleProductResource =
      getProductsListResource.addResource("{productId}");
    const getSingleProductIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambda
    );
    getSingleProductResource.addMethod("GET", getSingleProductIntegration);
  }
}
