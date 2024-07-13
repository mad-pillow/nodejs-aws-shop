import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import path from "path";
import { createLambda } from "../utils/createLambda";

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create lambda
    const basicAuthorizerLambda = createLambda(
      this,
      "BasicAuthorizer",
      path.join(__dirname, "../authorization-service/lambda/basicAuthorizer"),
      "basicAuthorizer.handler"
    );

    // Grant permissions
    basicAuthorizerLambda.grantInvoke(
      new iam.ServicePrincipal("apigateway.amazonaws.com")
    );
  }
}
