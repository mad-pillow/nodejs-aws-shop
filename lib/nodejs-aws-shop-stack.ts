import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class NodejsAwsShopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // health handler
    const health = new lambda.Function(this, "HealthHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/health"),
      handler: "health.handler",
    });

    // all products list handler
    const getProductsList = new lambda.Function(
      this,
      "AllProductsListHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("lambda/getProductsList"),
        handler: "getProductsList.handler",
      }
    );

    // single product handler
    const getProductsById = new lambda.Function(this, "SingleProductHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/getProductsById"),
      handler: "getProductsById.handler",
    });

    // API Gateaway
    const api = new apigateway.RestApi(this, "Api");

    // health handler with API gateaway integration
    const healthResource = api.root.addResource("health");
    const healthIntegration = new apigateway.LambdaIntegration(health);
    healthResource.addMethod("GET", healthIntegration);

    // all products list handler with API gateaway integration
    const getProductsListResource = api.root.addResource("products");
    const getProductsListIntegration = new apigateway.LambdaIntegration(
      getProductsList
    );
    getProductsListResource.addMethod("GET", getProductsListIntegration);

    // single product handler with API gateaway integration
    const getSingleProductResource =
      getProductsListResource.addResource("{productId}");
    const getSingleProductIntegration = new apigateway.LambdaIntegration(
      getProductsById
    );
    getSingleProductResource.addMethod("GET", getSingleProductIntegration);
  }
}
