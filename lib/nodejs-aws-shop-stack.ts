import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class NodejsAwsShopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const health = new lambda.Function(this, "HealthHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "health.handler",
    });

    const api = new apigateway.LambdaRestApi(this, "HealthApi", {
      handler: health,
      proxy: false,
    });

    const healthResource = api.root.addResource("health");
    healthResource.addMethod("GET");
  }
}
