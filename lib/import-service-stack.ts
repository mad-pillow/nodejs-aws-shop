import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import path from "path";
import { createLambda } from "../utils/createLambda";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get bucket
    const uploadFileBucket = s3.Bucket.fromBucketName(
      this,
      "UploadFileBucket",
      "dmytro-sychov-import-service-bucket"
    );

    // Create import products file lambda
    const importProductsFileLambda = createLambda(
      this,
      "ImportProductsFile",
      path.join(__dirname, "../import-service/lambda/importProductsFile"),
      "importProductsFile.handler"
    );

    // Create import file parser lambda
    const importFileParserLambda = createLambda(
      this,
      "ImportFileParser",
      path.join(__dirname, "../import-service/lambda/importFileParser"),
      "importFileParser.handler"
    );

    // Grant permissions from the bucket
    uploadFileBucket.grantPut(importProductsFileLambda);
    uploadFileBucket.grantReadWrite(importFileParserLambda);
    uploadFileBucket.grantDelete(importFileParserLambda);

    // API Gateaway
    const api = new apigateway.RestApi(this, "ImportProductsApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    // all products list handler with API gateaway integration
    const importProductsFileResource = api.root.addResource("import");
    const importProductsFileIntegration = new apigateway.LambdaIntegration(
      importProductsFileLambda
    );
    importProductsFileResource.addMethod("GET", importProductsFileIntegration);

    // event source for import file parser lambda
    importFileParserLambda.addEventSource(
      new S3EventSource(uploadFileBucket as s3.Bucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "uploaded/" }],
      })
    );
  }
}
