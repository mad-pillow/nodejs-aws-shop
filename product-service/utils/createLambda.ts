import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

/**
 *
 * @deprecated Use `createLambda` from ./utils/createLambda.ts
 */
export function createLambda(
  scope: Construct,
  id: string,
  handlerName: string,
  environment: { [key: string]: string } = {}
) {
  return new lambda.Function(scope, id, {
    runtime: lambda.Runtime.NODEJS_16_X,
    code: lambda.Code.fromAsset(
      path.join(__dirname, `../lambda/${handlerName}`)
    ),
    handler: `${handlerName}.handler`,
    environment,
  });
}
