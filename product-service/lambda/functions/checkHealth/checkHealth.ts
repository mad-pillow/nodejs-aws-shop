import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export function checkHealth(scope: Construct) {
  return new lambda.Function(scope, "CheckHealth", {
    runtime: lambda.Runtime.NODEJS_16_X,
    code: lambda.Code.fromAsset(
      path.join(__dirname, "../../handlers/checkHealth")
    ),
    handler: "checkHealth.handler",
  });
}
