import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as NodejsAwsShop from "../lib/nodejs-aws-shop-stack";

test("Lambda Functions Created", () => {
  const app = new cdk.App();
  const stack = new NodejsAwsShop.NodejsAwsShopStack(
    app,
    "NodejsAwsShopTestStack"
  );
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::Lambda::Function", 4);

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs16.x",
    Handler: "checkHealth.handler",
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs16.x",
    Handler: "getProductsList.handler",
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs16.x",
    Handler: "getProductsById.handler",
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs16.x",
    Handler: "createProduct.handler",
  });
});
