import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export function getProductsList(scope: Construct) {
  return new lambda.Function(scope, "GetProductsList", {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromAsset(
      path.join(__dirname, "../../handlers/getProductsList")
    ),
    handler: "getProductsList.handler",
  });
}
