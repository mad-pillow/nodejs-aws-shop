import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import path from "path";
import { createLambda } from "../utils/createLambda";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const uploadFileBucket = s3.Bucket.fromBucketName(
      this,
      "UploadFileBucket",
      "dmytro-sychov-import-service-bucket"
    );

    // Create lambda
    const importProductsFileLambda = createLambda(
      this,
      "ImportProductsFile",
      path.join(__dirname, "../import-service/lambda/importProductsFile"),
      "importProductsFile"
    );

    uploadFileBucket.grantPut(importProductsFileLambda);

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
  }
}
