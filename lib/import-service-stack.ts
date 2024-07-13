import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import path from "path";
import { createLambda } from "../utils/createLambda";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get basic authorizer lambda
    const basicAuthorizerLambda = lambda.Function.fromFunctionArn(
      this,
      "BasicAuthorizerFunction",
      "arn:aws:lambda:us-east-1:350262618260:function:AuthorizationServiceStack-BasicAuthorizer2B49C1FC-ZxrXcsbs7FBF"
    );

    // Get bucket
    const uploadFileBucket = s3.Bucket.fromBucketName(
      this,
      "UploadFileBucket",
      "dmytro-sychov-import-service-bucket"
    );

    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      "catalogItemsQueue",
      "arn:aws:sqs:us-east-1:350262618260:CatalogItemsQueue"
    );

    // prepare environment variables
    const environment = {
      CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
    };

    // Create import products file lambda
    const importProductsFileLambda = createLambda(
      this,
      "ImportProductsFile",
      path.join(__dirname, "../import-service/lambda/importProductsFile"),
      "importProductsFile.handler",
      environment
    );

    // Create import file parser lambda
    const importFileParserLambda = createLambda(
      this,
      "ImportFileParser",
      path.join(__dirname, "../import-service/lambda/importFileParser"),
      "importFileParser.handler",
      environment
    );

    // Grant permissions from the bucket
    uploadFileBucket.grantPut(importProductsFileLambda);
    uploadFileBucket.grantReadWrite(importFileParserLambda);
    uploadFileBucket.grantDelete(importFileParserLambda);

    // Grant permissions to the queue
    catalogItemsQueue.grantSendMessages(importFileParserLambda);

    // API Gateaway
    const api = new apigateway.RestApi(this, "ImportProductsApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // create lambda authorizer
    const basicAuthorizer = new apigateway.TokenAuthorizer(
      this,
      "BasicAuthorizer",
      {
        handler: basicAuthorizerLambda,
        identitySource: apigateway.IdentitySource.header("Authorization"),
      }
    );

    // all products list handler with API gateaway integration
    const importProductsFileResource = api.root.addResource("import");
    const importProductsFileIntegration = new apigateway.LambdaIntegration(
      importProductsFileLambda
    );
    importProductsFileResource.addMethod("GET", importProductsFileIntegration, {
      authorizer: basicAuthorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    // event source for import file parser lambda
    importFileParserLambda.addEventSource(
      new S3EventSource(uploadFileBucket as s3.Bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "uploaded/" }],
      })
    );
  }
}
