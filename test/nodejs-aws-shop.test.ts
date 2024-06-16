import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as NodejsAwsShop from "../lib/nodejs-aws-shop-stack";

test("Lambda Functions Created", () => {
  const app = new cdk.App();
  const stack = new NodejsAwsShop.NodejsAwsShopStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::Lambda::Function", 3);

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs20.x",
    Handler: "health.handler",
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs20.x",
    Handler: "getProductsList.handler",
  });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "nodejs20.x",
    Handler: "getProductsById.handler",
  });
});
