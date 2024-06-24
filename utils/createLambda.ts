import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export function createLambda(
  scope: Construct,
  id: string,
  baseHandlerPath: string,
  handlerName: string
) {
  return new lambda.Function(scope, id, {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromAsset(`${baseHandlerPath}/${handlerName}`),
    handler: `${handlerName}.handler`,
  });
}
